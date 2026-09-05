import React, { useEffect, useState } from "react";
import { Plus, Trash2, StickyNote } from "lucide-react";
import { api } from "../api";
import { PageHead, Loading } from "../components/ui";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");

  const load = () => api.listNotes().then(setNotes).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const addNote = async () => {
    if (!draft.trim()) return;
    const n = await api.createNote(draft);
    setNotes((ns) => [n, ...ns]);
    setDraft("");
  };
  const removeNote = async (id) => {
    await api.deleteNote(id);
    setNotes((ns) => ns.filter((n) => n.id !== id));
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHead title="یادداشت‌های من" sub="فضای شخصی شما — فقط برای خودتان قابل مشاهده است" />
      <div className="card" style={{ marginBottom: 16 }}>
        <textarea className="textarea" placeholder="یادداشت جدید بنویسید..." value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={addNote}><Plus size={14} />افزودن یادداشت</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12 }}>
        {notes.map((n) => (
          <div key={n.id} className="cmd-note-card">
            <button onClick={() => removeNote(n.id)} style={{ position: "absolute", left: 10, top: 10, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer" }}><Trash2 size={14} /></button>
            <div style={{ fontSize: 13, lineHeight: 1.8, paddingLeft: 20 }}>{n.text}</div>
          </div>
        ))}
        {notes.length === 0 && <div className="cmd-empty"><StickyNote size={24} /><div>هنوز یادداشتی ثبت نشده</div></div>}
      </div>
    </div>
  );
}
