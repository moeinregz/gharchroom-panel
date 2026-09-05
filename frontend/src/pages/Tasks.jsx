import React, { useEffect, useState } from "react";
import { Plus, Check, CheckSquare } from "lucide-react";
import { api } from "../api";
import { Badge, PageHead, Modal, Loading, ROLES } from "../components/ui";

export default function Tasks({ user }) {
  const canAssign = user.role === "admin" || user.role === "manager";
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", assignedTo: "", due: "", priority: "متوسط" });
  const [err, setErr] = useState("");

  const load = () => {
    Promise.all([api.listTasks(), canAssign ? api.listUsers() : Promise.resolve([])])
      .then(([t, e]) => { setTasks(t); setEmployees(e); if (e.length) setForm((f) => ({ ...f, assignedTo: f.assignedTo || e[0].id })); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const addTask = async () => {
    if (!form.title.trim() || !form.assignedTo) return;
    try {
      const t = await api.createTask({ ...form, assignedTo: Number(form.assignedTo) });
      setTasks((ts) => [...ts, t]);
      setShowModal(false);
      setForm({ title: "", desc: "", assignedTo: employees[0]?.id || "", due: "", priority: "متوسط" });
    } catch (e) { setErr(e.message); }
  };

  const toggle = async (id) => {
    const t = await api.toggleTask(id);
    setTasks((ts) => ts.map((x) => (x.id === id ? t : x)));
  };

  if (loading) return <Loading />;

  const columns = [{ key: "todo", label: "در جریان" }, { key: "done", label: "انجام‌شده" }];

  return (
    <div>
      <PageHead title="مدیریت وظایف" sub={canAssign ? "تسک‌ها را به اعضای تیم اختصاص دهید" : "وظایف اختصاص‌یافته به شما"}
        action={canAssign && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} />تسک جدید</button>} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {columns.map((col) => (
          <div className="card" key={col.key}>
            <div className="card-head">
              <div className="card-title">{col.label}</div>
              <Badge tone={col.key === "done" ? "green" : "amber"}>{tasks.filter((t) => t.status === col.key).length}</Badge>
            </div>
            {tasks.filter((t) => t.status === col.key).length === 0 && (
              <div className="cmd-empty"><CheckSquare size={26} /><div>موردی وجود ندارد</div></div>
            )}
            {tasks.filter((t) => t.status === col.key).map((t) => {
              const emp = employees.find((e) => e.id === t.assignedTo);
              return (
                <div key={t.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{t.title}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 4 }}>{t.desc}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                        {emp && <Badge tone="gray">👤 {emp.name}</Badge>}
                        <Badge tone="gray">موعد: {t.due || "—"}</Badge>
                        <Badge tone={t.priority === "بالا" ? "red" : t.priority === "متوسط" ? "amber" : "gray"}>{t.priority}</Badge>
                      </div>
                    </div>
                    {(t.assignedTo === user.id || canAssign) && (
                      <button className="btn btn-sm btn-ghost" onClick={() => toggle(t.id)}>
                        {t.status === "done" ? "بازگردانی" : <><Check size={13} /> اتمام</>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="اختصاص تسک جدید" onClose={() => setShowModal(false)}>
          {err && <div className="cmd-login-error">{err}</div>}
          <div className="field"><label>عنوان تسک</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field"><label>توضیحات</label><textarea className="textarea" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></div>
          <div className="field-row">
            <div className="field"><label>اختصاص به</label>
              <select className="select" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                {employees.filter((e) => e.role !== "admin").map((e) => <option key={e.id} value={e.id}>{e.name} — {ROLES[e.role]}</option>)}
              </select>
            </div>
            <div className="field"><label>اولویت</label>
              <select className="select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option>بالا</option><option>متوسط</option><option>پایین</option>
              </select>
            </div>
          </div>
          <div className="field"><label>موعد انجام</label><input className="input" placeholder="۱۴۰۳/۰۶/۰۱" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></div>
          <button className="btn btn-primary btn-block" onClick={addTask}>ثبت و اختصاص تسک</button>
        </Modal>
      )}
    </div>
  );
}
