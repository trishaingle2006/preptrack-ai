import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowRight, BrainCircuit, CheckCircle2, RotateCcw, SkipForward, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { interviewTopics } from "../data/adaptiveInterviewQuestions";
import { db } from "../lib/firebase";
import { adjustDifficulty, createReport, evaluateAnswer, selectNextQuestion } from "../services/adaptiveInterviewEngine";
import { evaluateWithAi } from "../services/aiInterviewService";

const questionLimit = 5;

export default function AdaptiveInterviewPage() {
  const { user } = useAuth();
  const [stage, setStage] = useState("setup");
  const [settings, setSettings] = useState({ topic: "react", difficulty: "easy" });
  const [difficulty, setDifficulty] = useState("easy");
  const [current, setCurrent] = useState(null);
  const [answer, setAnswer] = useState("");
  const [responses, setResponses] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const report = useMemo(() => createReport(responses), [responses]);

  function startInterview() {
    const first = selectNextQuestion({ topic: settings.topic, difficulty: settings.difficulty, askedIds: [] });
    setDifficulty(settings.difficulty); setCurrent(first); setResponses([]); setAnswer(""); setFeedback(null); setStage("active");
  }

  async function finishInterview(finalResponses) {
    setStage("report");
    if (!db || !user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "interviewSessions"), {
        topic: settings.topic,
        type: "adaptive",
        status: "completed",
        responses: finalResponses,
        report: createReport(finalResponses),
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp(),
      });
    } finally { setSaving(false); }
  }

  async function submit(skipped = false) {
    if (evaluating) return;
    if (!skipped && answer.trim().length < 10) { setFeedback({ error: true, feedback: "Please provide a more complete answer or choose Skip question." }); return; }
    setEvaluating(true);
    let result;
    try {
      result = skipped ? evaluateAnswer({ answer, question: current, previousAnswers: responses.map((item) => item.answer), skipped: true }) : await evaluateWithAi({
        topic: settings.topic,
        difficulty,
        question: current.prompt,
        answer: answer.trim(),
        history: responses.map((item) => ({ question: item.prompt, answer: item.answer, score: item.score })),
        askedQuestions: [...responses.map((item) => item.prompt), current.prompt],
      });
    } catch (error) {
      console.warn("AI evaluation unavailable; using local fallback.", error);
      result = { ...evaluateAnswer({ answer, question: current, previousAnswers: responses.map((item) => item.answer), skipped }), evaluator: "local-fallback", serviceNotice: "AI service unavailable; local evaluation was used." };
    } finally {
      setEvaluating(false);
    }
    const nextDifficulty = adjustDifficulty(difficulty, result.decision);
    const response = { questionId: current.id, prompt: current.prompt, concept: current.concept, difficulty, answer: skipped ? "" : answer.trim(), skipped, ...result, nextDifficulty, evaluatedAt: new Date().toISOString() };
    const nextResponses = [...responses, response];
    setResponses(nextResponses); setFeedback(result); setAnswer("");
    if (nextResponses.length >= questionLimit) { finishInterview(nextResponses); return; }
    const generated = result.nextQuestion?.prompt ? { id: `ai-${Date.now()}`, topic: settings.topic, prompt: result.nextQuestion.prompt, concept: result.nextQuestion.concept, difficulty: nextDifficulty, keywords: [] } : null;
    const next = generated ?? selectNextQuestion({ topic: settings.topic, difficulty: nextDifficulty, askedIds: nextResponses.map((item) => item.questionId) });
    if (!next) { finishInterview(nextResponses); return; }
    setDifficulty(next.difficulty || nextDifficulty); setCurrent(next);
  }

  if (stage === "setup") return <section className="interview-setup workspace-page"><div className="workspace-heading"><div><span className="eyebrow">Adaptive Interview Engine</span><h1>An interview that responds to you.</h1><p>Every answer influences the difficulty and direction of the next question.</p></div><BrainCircuit size={76} /></div><div className="setup-card"><label>Interview topic<select value={settings.topic} onChange={(event) => setSettings({ ...settings, topic: event.target.value })}>{interviewTopics.map((topic) => <option key={topic.value} value={topic.value}>{topic.label}</option>)}</select></label><label>Starting difficulty<select value={settings.difficulty} onChange={(event) => setSettings({ ...settings, difficulty: event.target.value })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><div className="setup-summary"><strong><CheckCircle2 size={16} />{questionLimit} questions</strong><span><CheckCircle2 size={16} />Dynamic difficulty</span><span><CheckCircle2 size={16} />Context-aware scoring</span><span><CheckCircle2 size={16} />Progression report</span></div><button onClick={startInterview}>Begin interview <ArrowRight size={18} /></button></div></section>;

  if (stage === "report") return <section className="workspace-page"><div className="report-hero"><CheckCircle2 size={54} /><span className="eyebrow light">Interview completed</span><h1>Your adaptive interview report</h1><p>{saving ? "Saving your report…" : "Your performance and difficulty progression have been recorded."}</p></div><div className="report-metrics"><article><span>Average score</span><strong>{report.averageScore}/10</strong></article><article><span>Answered</span><strong>{report.answered}</strong></article><article><span>Skipped</span><strong>{report.skipped}</strong></article><article><span>Difficulty</span><strong>{report.startingDifficulty} → {report.endingDifficulty}</strong></article></div><div className="report-details"><article><h2>Strengths</h2><p>{report.strengths.length ? report.strengths.join(", ") : "Complete more strong answers to establish strengths."}</p></article><article><h2>Improvement areas</h2><p>{report.improvements.length ? report.improvements.join(", ") : "No major weak concepts detected in this session."}</p></article><article className="response-history"><h2>Question progression</h2>{responses.map((item, index) => <div key={item.questionId}><span>Q{index + 1}</span><p>{item.prompt}</p><strong>{item.skipped ? "Skipped" : `${item.score}/10`} · {item.difficulty} → {item.nextDifficulty}</strong></div>)}</article></div><button className="restart-interview" onClick={() => setStage("setup")}><RotateCcw size={18} />Start another interview</button></section>;

  return <section className="workspace-page"><div className="interview-status"><div><span>Question {responses.length + 1} of {questionLimit}</span><strong>{settings.topic}</strong></div><span className={`level ${difficulty}`}>{difficulty}</span></div><div className="interview-progress"><span style={{ width: `${((responses.length + 1) / questionLimit) * 100}%` }} /></div><article className="interview-card"><div className="interview-card-heading"><BrainCircuit /><span>AI Interviewer</span></div><h1>{current.prompt}</h1><p>Answer clearly and include reasoning or an example when appropriate.</p><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your answer here…" maxLength={2500} autoFocus /><div className="answer-footer"><span>{answer.trim().split(/\s+/).filter(Boolean).length} words</span><div><button className="skip-answer" onClick={() => submit(true)}><SkipForward size={17} />Skip question</button><button onClick={() => submit(false)}>Evaluate answer <TrendingUp size={17} /></button></div></div></article>{feedback && <div className={feedback.error ? "answer-feedback error" : "answer-feedback"}><strong>{feedback.error ? "Answer required" : feedback.repeated ? "Repeated answer detected" : `Previous answer: ${feedback.score}/10`}</strong><p>{feedback.feedback}</p>{feedback.serviceNotice && <small>{feedback.serviceNotice}</small>}</div>}</section>;
}
