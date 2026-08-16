import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Check, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { questionBank } from "../data/questionBank";
import { db } from "../lib/firebase";

const types = ["all", "aptitude", "coding", "interview"];

export default function PracticePage() {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(Boolean(db));

  useEffect(() => {
    if (!db || !user) {
      setLoading(false);
      return;
    }
    getDoc(doc(db, "users", user.uid, "progress", "practice"))
      .then((snapshot) => setCompleted(snapshot.data()?.completedQuestionIds ?? []))
      .finally(() => setLoading(false));
  }, [user]);

  const visibleQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questionBank.filter((item) => (
      (activeType === "all" || item.type === activeType)
      && (!term || `${item.title} ${item.category} ${item.question}`.toLowerCase().includes(term))
    ));
  }, [activeType, search]);

  async function toggleComplete(questionId) {
    const next = completed.includes(questionId)
      ? completed.filter((id) => id !== questionId)
      : [...completed, questionId];
    setCompleted(next);
    if (db && user) {
      await setDoc(doc(db, "users", user.uid, "progress", "practice"), {
        completedQuestionIds: next,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  }

  const percent = questionBank.length ? Math.round((completed.length / questionBank.length) * 100) : 0;

  return (
    <section className="workspace-page">
      <div className="workspace-heading"><div><span className="eyebrow">Preparation library</span><h1>Practice questions</h1><p>Build foundations before starting adaptive and company-specific interviews.</p></div><div className="completion-ring"><strong>{percent}%</strong><span>complete</span></div></div>
      <div className="practice-toolbar">
        <div className="filter-tabs">{types.map((type) => <button className={activeType === type ? "active" : ""} key={type} onClick={() => setActiveType(type)}>{type}</button>)}</div>
        <label className="practice-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions" /></label>
      </div>
      {loading ? <div className="empty-state">Loading your progress…</div> : (
        <div className="question-grid">
          {visibleQuestions.map((item) => {
            const isComplete = completed.includes(item.id);
            return <article className={isComplete ? "practice-card complete" : "practice-card"} key={item.id}>
              <div className="question-meta"><span>{item.type}</span><span className={`level ${item.difficulty}`}>{item.difficulty}</span></div>
              <h2>{item.title}</h2><small>{item.category}</small><p>{item.question}</p>
              <details><summary>View explanation</summary><div>{item.answer}</div></details>
              <button className="complete-button" onClick={() => toggleComplete(item.id)}>{isComplete && <Check size={17} />}{isComplete ? "Completed" : "Mark complete"}</button>
            </article>;
          })}
        </div>
      )}
    </section>
  );
}
