import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(db));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db || !user) return undefined;
    const notesQuery = query(collection(db, "users", user.uid, "notes"), orderBy("createdAt", "desc"));
    return onSnapshot(notesQuery, (snapshot) => {
      setNotes(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      setLoading(false);
    }, () => {
      setError("Your notes could not be loaded. Please refresh and try again.");
      setLoading(false);
    });
  }, [user]);

  async function saveNote(event) {
    event.preventDefault();
    if (!db || !user || !form.title.trim() || !form.content.trim()) return;
    setError("");
    setBusy(true);
    try {
      await addDoc(collection(db, "users", user.uid, "notes"), { title: form.title.trim(), content: form.content.trim(), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setForm({ title: "", content: "" });
    } catch {
      setError("Your note could not be saved. Please try again.");
    } finally { setBusy(false); }
  }

  async function removeNote(note) {
    setError("");
    try { await deleteDoc(doc(db, "users", user.uid, "notes", note.id)); }
    catch { setError(`“${note.title}” could not be deleted. Please try again.`); }
  }

  return <section className="workspace-page"><div className="workspace-heading"><div><span className="eyebrow">Personal workspace</span><h1>Study notes</h1><p>Your notes are private and synchronized with your account.</p></div></div>{error && <div className="auth-alert error" role="alert">{error}</div>}
    <div className="notes-layout"><form className="note-editor" onSubmit={saveNote}><h2>Create a note</h2><label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={100} required /></label><label>Notes<textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} maxLength={3000} required /></label><button disabled={busy || !db}><Plus size={18} />{busy ? "Saving…" : "Save note"}</button>{!db && <small>Configure Firebase to save notes.</small>}</form>
    <div className="notes-list">{loading ? <div className="empty-state">Loading your notes…</div> : notes.length === 0 ? <div className="empty-state">No notes yet. Capture an important concept or interview insight.</div> : notes.map((note) => <article className="saved-note" key={note.id}><div><h2>{note.title}</h2><button onClick={() => removeNote(note)} aria-label={`Delete ${note.title}`} title="Delete note"><Trash2 size={17} /></button></div><p>{note.content}</p></article>)}</div></div>
  </section>;
}
