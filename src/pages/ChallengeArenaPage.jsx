import { Award, CheckCircle2, Clock3, Crown, Flame, LoaderCircle, Medal, Send, Swords, Trophy, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { loadChallengeArena, submitChallenge } from "../services/challengeService";

export default function ChallengeArenaPage() {
  const [data, setData] = useState(null);
  const [cadence, setCadence] = useState("daily");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const challenge = useMemo(() => data?.challenges?.find((item) => item.cadence === cadence), [data, cadence]);

  async function refresh() {
    setLoading(true); setError("");
    try { setData(await loadChallengeArena()); }
    catch (caught) { setError(caught.message?.replace(/^Firebase: /, "") || "Unable to load the challenge arena."); }
    finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function submit(event) {
    event.preventDefault(); setError("");
    if (answer.trim().length < 40) { setError("Write at least 40 characters so your reasoning can be evaluated."); return; }
    setSubmitting(true);
    try {
      const outcome = await submitChallenge(challenge.id, answer.trim());
      setResult(outcome);
      await refresh();
    }
    catch (caught) { setError(caught.message?.replace(/^Firebase: /, "") || "Unable to submit this challenge."); }
    finally { setSubmitting(false); }
  }

  if (loading && !data) return <div className="arena-loading"><LoaderCircle className="spin" />Preparing today’s arena…</div>;
  const stats = data?.userStats ?? { totalScore: 0, completed: 0, streak: 0, badges: [], rank: null };

  return <section className="workspace-page"><div className="arena-hero"><div><span className="eyebrow light">Peer Challenge Arena</span><h1>Compete. Improve. Climb.</h1><p>Take on AI-generated interview challenges, build streaks, unlock badges, and compare your progress with peers.</p></div><Trophy size={105} /></div><div className="arena-stats"><article><Crown /><span>Current rank</span><strong>{stats.rank ? `#${stats.rank}` : "Unranked"}</strong></article><article><Flame /><span>Current streak</span><strong>{stats.streak ?? 0} {(stats.streak ?? 0) === 1 ? "day" : "days"}</strong></article><article><Swords /><span>Completed</span><strong>{stats.completed ?? 0}</strong></article><article><Medal /><span>Total points</span><strong>{stats.totalScore ?? 0}</strong></article></div>{error && <div className="auth-alert error">{error}</div>}<div className="arena-layout"><main className="challenge-panel"><div className="challenge-tabs"><button className={cadence === "daily" ? "active" : ""} onClick={() => { setCadence("daily"); setResult(null); }}>Daily Challenge</button><button className={cadence === "weekly" ? "active" : ""} onClick={() => { setCadence("weekly"); setResult(null); }}>Weekly Challenge</button></div>{challenge && <article className="active-challenge"><div className="challenge-meta"><span>{challenge.category}</span><span className={`level ${challenge.difficulty}`}>{challenge.difficulty}</span><span><Clock3 size={14} />{challenge.cadence}</span></div><h2>{challenge.title}</h2><p>{challenge.prompt}</p>{result ? <div className="challenge-result"><Award /><div><strong>{result.score}/100 · Rank #{result.rank}</strong><p>{result.feedback}</p>{result.improvements?.length > 0 && <small>Improve: {result.improvements.join(", ")}</small>}</div></div> : challenge.attempted ? <div className="attempted-state"><CheckCircle2 /><strong>Challenge completed</strong><span>Your score is recorded on the leaderboard. A new {cadence} challenge will appear in the next cycle.</span></div> : <form onSubmit={submit}><label>Your response<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Explain your reasoning clearly and address every part of the challenge…" maxLength={3000} /></label><div><span>{answer.length}/3,000 characters</span><button disabled={submitting}>{submitting ? <><LoaderCircle className="spin" />Scoring…</> : <><Send />Submit once</>}</button></div><small>Submissions are final to keep the competition fair.</small></form>}</article>}</main><aside className="leaderboard-panel"><div className="leaderboard-title"><UsersRound /><div><h2>Leaderboard</h2><span>Top candidates by total points</span></div></div><div className="leaderboard-list">{data?.leaderboard?.length ? data.leaderboard.map((item) => <article key={item.uid}><strong className={`rank rank-${item.rank}`}>{item.rank}</strong><div><b>{item.displayName}</b><small>{item.badge} · {item.completed} completed</small></div><span>{item.totalScore}</span></article>) : <p>No ranked candidates yet. Complete the first challenge.</p>}</div><div className="badge-shelf"><h3>Your badges</h3>{stats.badges?.length ? <div>{stats.badges.map((badge) => <span key={badge}><Award size={14} />{badge}</span>)}</div> : <p>Complete challenges and earn high scores to unlock badges.</p>}</div></aside></div></section>;
}
