import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowRight, Building2, CheckCircle2, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { companyProfiles, getCompanyProfile } from "../data/companyProfiles";
import { db } from "../lib/firebase";
import { adjustDifficulty, createReport, evaluateAnswer } from "../services/adaptiveInterviewEngine";
import { evaluateWithAi } from "../services/aiInterviewService";

const roles = ["Frontend Developer", "Backend Developer", "Full-Stack Developer", "Graduate Engineer"];
const roleTopics = { "Frontend Developer": "react", "Backend Developer": "databases", "Full-Stack Developer": "javascript", "Graduate Engineer": "dsa" };
const questionLimit = 5;

export default function RecruiterSimulatorPage() {
  const { user } = useAuth();
  const [stage, setStage] = useState("setup");
  const [companyId, setCompanyId] = useState("google");
  const [role, setRole] = useState(roles[0]);
  const [difficulty, setDifficulty] = useState("medium");
  const [current, setCurrent] = useState(null);
  const [answer, setAnswer] = useState("");
  const [responses, setResponses] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);
  const company = useMemo(() => getCompanyProfile(companyId), [companyId]);
  const report = useMemo(() => createReport(responses), [responses]);
  const meetsStandard = report.averageScore >= company.threshold;

  function staticQuestion(index, level = company.initialDifficulty) {
    return { id: `${company.id}-${index}`, prompt: company.questions[index], concept: company.focus[index % company.focus.length], difficulty: level, keywords: company.focus.map((item) => item.toLowerCase()) };
  }

  function start() {
    setDifficulty(company.initialDifficulty); setCurrent(staticQuestion(0)); setResponses([]); setAnswer(""); setFeedback(null); setStage("active");
  }

  async function finish(items) {
    setStage("report");
    if (!db || !user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "interviewSessions"), { type: "recruiter-simulator", companyId: company.id, companyName: company.name, role, status: "completed", responses: items, report: { ...createReport(items), threshold: company.threshold }, createdAt: serverTimestamp(), completedAt: serverTimestamp() });
    } finally { setSaving(false); }
  }

  async function submit() {
    if (evaluating) return;
    if (answer.trim().length < 10) { setFeedback({ error: true, feedback: "Please provide a complete response before evaluation." }); return; }
    setEvaluating(true);
    let result;
    try {
      result = await evaluateWithAi({ topic: roleTopics[role], difficulty, question: current.prompt, answer: answer.trim(), history: responses.map((item) => ({ question: item.prompt, answer: item.answer, score: item.score })), askedQuestions: [...responses.map((item) => item.prompt), current.prompt], companyProfile: { id: company.id, role } });
    } catch (error) {
      console.warn("Company simulation AI unavailable; local fallback used.", error);
      result = { ...evaluateAnswer({ answer, question: current, previousAnswers: responses.map((item) => item.answer) }), evaluator: "local-fallback", serviceNotice: "AI service unavailable; local evaluation was used." };
    } finally { setEvaluating(false); }

    const nextDifficulty = adjustDifficulty(difficulty, result.decision);
    const response = { questionId: current.id, prompt: current.prompt, concept: current.concept, difficulty, answer: answer.trim(), ...result, nextDifficulty, evaluatedAt: new Date().toISOString() };
    const nextResponses = [...responses, response];
    setResponses(nextResponses); setAnswer(""); setFeedback(result);
    if (nextResponses.length >= questionLimit) { finish(nextResponses); return; }
    const generated = result.nextQuestion?.prompt ? { id: `${company.id}-ai-${Date.now()}`, prompt: result.nextQuestion.prompt, concept: result.nextQuestion.concept, difficulty: result.nextQuestion.difficulty || nextDifficulty, keywords: company.focus.map((item) => item.toLowerCase()) } : staticQuestion(nextResponses.length, nextDifficulty);
    setCurrent(generated); setDifficulty(generated.difficulty);
  }

  if (stage === "setup") return <section className="workspace-page"><div className="workspace-heading"><div><span className="eyebrow">AI Recruiter Simulator</span><h1>Practise for different interview environments.</h1><p>Choose a simulated company profile and experience its focus, style, and performance expectations.</p></div><Building2 size={76} /></div><div className="simulator-disclaimer"><ShieldCheck size={20} /><span>These are educational practice profiles based on broad interview patterns. They are not official or guaranteed hiring processes.</span></div><div className="company-grid">{companyProfiles.map((item) => <button className={companyId === item.id ? "company-card selected" : "company-card"} key={item.id} onClick={() => setCompanyId(item.id)} style={{ "--company-color": item.color }}><span>{item.initials}</span><strong>{item.name}</strong><small>{item.focus.slice(0, 2).join(" · ")}</small></button>)}</div><article className="company-profile"><div><span className="company-avatar" style={{ background: company.color }}>{company.initials}</span><div><h2>{company.name} practice profile</h2><p>{company.style}</p></div></div><div className="profile-facts"><span>Starting level <strong>{company.initialDifficulty}</strong></span><span>Expected score <strong>{company.threshold}/10</strong></span><span>Questions <strong>{questionLimit}</strong></span></div><div className="focus-tags">{company.focus.map((item) => <span key={item}>{item}</span>)}</div><label>Target role<select value={role} onChange={(event) => setRole(event.target.value)}>{roles.map((item) => <option key={item}>{item}</option>)}</select></label><button onClick={start}>Start {company.name} simulation <ArrowRight size={18} /></button></article></section>;

  if (stage === "report") return <section className="workspace-page"><div className={meetsStandard ? "company-result meets" : "company-result developing"}><CheckCircle2 size={50} /><span className="eyebrow">{company.name} simulation complete</span><h1>{meetsStandard ? "You met the simulated standard" : "More preparation recommended"}</h1><p>{saving ? "Saving company report…" : `Your average was ${report.averageScore}/10 against the practice threshold of ${company.threshold}/10.`}</p></div><div className="report-metrics"><article><span>Overall score</span><strong>{report.averageScore}/10</strong></article><article><span>Expected standard</span><strong>{company.threshold}/10</strong></article><article><span>Ending difficulty</span><strong>{report.endingDifficulty}</strong></article><article><span>Target role</span><strong>{role}</strong></article></div><div className="company-feedback-grid"><article><h2>Company-specific assessment</h2><p>{meetsStandard ? `Your responses showed the reasoning and depth expected by this ${company.name} practice profile.` : `Focus on ${report.improvements.length ? report.improvements.join(", ") : company.focus.slice(0, 2).join(" and ")} before repeating this simulation.`}</p></article><article><h2>Evaluation emphasis</h2>{Object.entries(company.weights).map(([key, value]) => <div className="weight-row" key={key}><span>{key.replace(/([A-Z])/g, " $1")}</span><div><i style={{ width: `${value}%` }} /></div><strong>{value}%</strong></div>)}</article></div><div className="response-history report-panel"><h2>Interview progression</h2>{responses.map((item, index) => <div key={item.questionId}><span>Q{index + 1}</span><p>{item.prompt}</p><strong>{item.score}/10 · {item.difficulty} → {item.nextDifficulty}</strong></div>)}</div><button className="restart-interview" onClick={() => setStage("setup")}><RotateCcw size={18} />Try another company</button></section>;

  return <section className="workspace-page"><div className="simulator-header"><div><span className="company-avatar small" style={{ background: company.color }}>{company.initials}</span><div><strong>{company.name}</strong><small>{role} · Question {responses.length + 1} of {questionLimit}</small></div></div><span className={`level ${difficulty}`}>{difficulty}</span></div><div className="interview-progress"><span style={{ width: `${((responses.length + 1) / questionLimit) * 100}%` }} /></div><article className="interview-card"><div className="interview-card-heading"><Building2 /><span>{company.name} Recruiter</span></div><h1>{current.prompt}</h1><p>{company.style}</p><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Structure your response with reasoning and evidence…" maxLength={2500} /><div className="answer-footer"><span>{answer.trim().split(/\s+/).filter(Boolean).length} words</span><button onClick={submit} disabled={evaluating}>{evaluating ? "Evaluating…" : "Submit response"}<Send size={17} /></button></div></article>{feedback && <div className={feedback.error ? "answer-feedback error" : "answer-feedback"}><strong>{feedback.error ? "Response required" : `Previous response: ${feedback.score}/10`}</strong><p>{feedback.feedback}</p>{feedback.serviceNotice && <small>{feedback.serviceNotice}</small>}</div>}</section>;
}
