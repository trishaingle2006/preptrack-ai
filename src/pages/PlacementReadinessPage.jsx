import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { BarChart3, FileText, History, LoaderCircle, Sparkles, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { analyzeReadiness } from "../services/aiInterviewService";

const candidateTypes = [
  { value: "fresher", label: "Fresher / Graduate" },
  { value: "internship", label: "Internship Seeker" },
  { value: "experienced", label: "Experienced Candidate" },
];

const scoreLabels = { resume: "Resume evidence", technical: "Technical interviews", assessment: "Skill assessment", communication: "Communication" };

function RoadmapList({ title, items }) {
  return <article className="roadmap-card"><h3>{title}</h3>{items?.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No major gap detected in this area.</p>}</article>;
}

export default function PlacementReadinessPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ candidateType: "fresher", targetRole: "Frontend Developer", resumeText: "" });
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db || !user) return undefined;
    const historyQuery = query(collection(db, "users", user.uid, "readinessReports"), orderBy("createdAt", "desc"), limit(8));
    return onSnapshot(historyQuery, (snapshot) => setHistory(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))));
  }, [user]);

  async function loadResumeFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name) || file.size > 250_000) { setError("Upload a TXT or Markdown resume smaller than 250 KB, or paste the resume text."); return; }
    const resumeText = await file.text();
    setForm((current) => ({ ...current, resumeText }));
    setError("");
  }

  async function generate(event) {
    event.preventDefault(); setError("");
    if (form.resumeText.trim().length < 200) { setError("Add at least 200 characters of resume content for a meaningful analysis."); return; }
    setBusy(true);
    try { setReport(await analyzeReadiness({ ...form, resumeText: form.resumeText.trim() })); }
    catch (caught) { setError(caught.message?.replace(/^Firebase: /, "") || "Unable to generate the readiness report."); }
    finally { setBusy(false); }
  }

  if (report) return <section className="workspace-page"><div className={`readiness-hero ${report.classification.toLowerCase().replaceAll(" ", "-")}`}><Sparkles size={45} /><span className="eyebrow light">Placement Readiness Report</span><h1>{report.scores.overall}/100</h1><strong>{report.classification}</strong><p>{report.roadmap.summary}</p></div><div className="score-breakdown">{Object.entries(scoreLabels).map(([key, label]) => <article key={key}><div><span>{label}</span><strong>{report.scores[key]}</strong></div><div className="score-track"><i style={{ width: `${report.scores[key]}%` }} /></div></article>)}</div><div className="evidence-strip"><span><strong>{report.evidence.interviewsAnalyzed}</strong> interviews analyzed</span><span><strong>{report.evidence.practiceQuestionsCompleted}</strong> practice questions completed</span><span><strong>{form.candidateType}</strong> recommendation profile</span></div><section><div className="section-heading"><div><span className="eyebrow">Personalized roadmap</span><h2>What to improve next</h2></div></div><div className="roadmap-grid"><RoadmapList title="Weak technical areas" items={report.roadmap.weakTechnicalAreas} /><RoadmapList title="Communication gaps" items={report.roadmap.communicationGaps} /><RoadmapList title="Missing industry skills" items={report.roadmap.missingIndustrySkills} /><RoadmapList title="Recommended technologies" items={report.roadmap.technologies} /><RoadmapList title="Portfolio projects" items={report.roadmap.projects} /><RoadmapList title="Certifications" items={report.roadmap.certifications} /><RoadmapList title="Interview topics" items={report.roadmap.interviewTopics} /><RoadmapList title="Immediate next steps" items={report.roadmap.nextSteps} /></div></section><button className="new-analysis" onClick={() => setReport(null)}>Generate another analysis</button></section>;

  return <section className="workspace-page"><div className="workspace-heading"><div><span className="eyebrow">AI Placement Readiness Engine</span><h1>Turn performance evidence into a roadmap.</h1><p>Combine your resume, completed practice, and interview history into one evolving readiness score.</p></div><Target size={76} /></div><div className="readiness-layout"><form className="readiness-form" onSubmit={generate}><h2>Candidate profile</h2><div className="two-fields"><label>Candidate type<select value={form.candidateType} onChange={(event) => setForm({ ...form, candidateType: event.target.value })}>{candidateTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Target role<input value={form.targetRole} onChange={(event) => setForm({ ...form, targetRole: event.target.value })} maxLength={100} required /></label></div><label>Resume content<textarea value={form.resumeText} onChange={(event) => setForm({ ...form, resumeText: event.target.value })} placeholder="Paste the text from your resume here. Include education, skills, projects, experience, achievements, and certifications." maxLength={12000} required /></label><label className="resume-upload"><FileText size={18} />Or load a TXT/Markdown resume<input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={loadResumeFile} /></label><small>{form.resumeText.length}/12,000 characters</small>{error && <div className="auth-alert error">{error}</div>}<button disabled={busy}>{busy ? <><LoaderCircle className="spin" />Analyzing evidence…</> : <><BarChart3 />Generate readiness report</>}</button></form><aside className="readiness-history"><div><History /><h2>Readiness history</h2></div>{history.length ? history.map((item, index) => <article key={item.id}><span>Assessment {history.length - index}</span><strong>{item.scores?.overall ?? 0}/100</strong><small>{item.classification}</small></article>) : <p>Generate your first report to begin historical tracking.</p>}</aside></div></section>;
}
