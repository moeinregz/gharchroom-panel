import React, { useEffect, useState } from "react";
import { Plus, Unlock, Lock, Trash2 } from "lucide-react";
import { api } from "../api";
import { Avatar, Badge, PageHead, Modal, Loading, ROLES } from "../components/ui";

export default function Team({ user }) {
  const isAdmin = user?.role === "admin";
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "sales", position: "", phone: "", email: "" });
  const [err, setErr] = useState("");

  const load = () => api.listUsers().then(setEmployees).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const addEmployee = async () => {
    setErr("");
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) return;
    try {
      const e = await api.createUser(form);
      setEmployees((es) => [...es, e]);
      setShowModal(false);
      setForm({ name: "", username: "", password: "", role: "sales", position: "", phone: "", email: "" });
    } catch (e) { setErr(e.message); }
  };

  const removeEmployee = async (e) => {
    if (!window.confirm(`آیا از حذف «${e.name}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`)) return;
    try {
      await api.deleteUser(e.id);
      setEmployees((es) => es.filter((x) => x.id !== e.id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHead title="اعضای تیم" sub="اطلاعات کامل پرسنل و نقش شغلی هرکدام" action={<button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} />افزودن عضو</button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px,1fr))", gap: 14 }}>
        {employees.map((e) => (
          <div className="card" key={e.id}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                <Avatar name={e.name} size={44} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{e.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{e.position}</div>
                </div>
              </div>
              {isAdmin && (
                <button className="btn btn-sm btn-danger" onClick={() => removeEmployee(e)} title="حذف عضو"><Trash2 size={13} /></button>
              )}
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-faint)" }}>نقش</span><Badge tone="green">{ROLES[e.role]}</Badge></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-faint)" }}>شماره تماس</span><span>{e.phone}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-faint)" }}>ایمیل</span><span style={{ direction: "ltr" }}>{e.email}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-faint)" }}>تاریخ عضویت</span><span>{e.join}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-faint)" }}>دسترسی چت</span>
                {e.chatEnabled ? <Badge tone="green"><Unlock size={11} /> فعال</Badge> : <Badge tone="red"><Lock size={11} /> غیرفعال</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="افزودن عضو جدید" onClose={() => setShowModal(false)}>
          {err && <div className="cmd-login-error">{err}</div>}
          <div className="field-row">
            <div className="field"><label>نام و نام خانوادگی</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>نقش</label>
              <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {Object.entries(ROLES).filter(([k]) => k !== "customer").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field"><label>نام کاربری (برای ورود)</label><input className="input" style={{ direction: "ltr" }} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
            <div className="field"><label>رمز عبور موقت</label><input className="input" style={{ direction: "ltr" }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <div className="field"><label>عنوان شغلی</label><input className="input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
          <div className="field-row">
            <div className="field"><label>شماره تماس</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="field"><label>ایمیل</label><input className="input" style={{ direction: "ltr" }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary btn-block" onClick={addEmployee}>افزودن به تیم</button>
        </Modal>
      )}
    </div>
  );
}
