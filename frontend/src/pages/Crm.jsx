import React, { useEffect, useState } from "react";
import { Plus, Download, Trash2, Search, Check } from "lucide-react";
import { api } from "../api";
import { Badge, PageHead, Modal, Loading, exportExcel, RowCheckbox } from "../components/ui";

export default function Crm({ user }) {
  const isAdmin = user?.role === "admin";
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", type: "ورودی", date: "", note: "", status: "در انتظار" });
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState(() => new Set());

  const load = () => api.listCalls().then(setCalls).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const addCall = async () => {
    if (!form.name.trim()) return;
    try {
      const c = await api.createCall(form);
      setCalls((cs) => [c, ...cs]);
      setShowModal(false);
      setForm({ name: "", phone: "", type: "ورودی", date: "", note: "", status: "در انتظار" });
    } catch (e) { setErr(e.message); }
  };

  if (loading) return <Loading />;

  const filtered = calls.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [c.name, c.phone, c.note].some((v) => (v || "").toLowerCase().includes(q));
  });

  const toggleSelected = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));
  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);
        filtered.forEach((c) => next.delete(c.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((c) => next.add(c.id));
      return next;
    });
  };

  const exportCalls = () => {
    const rows = filtered.filter((c) => selected.size === 0 || selected.has(c.id));
    exportExcel(
      "crm-calls.xlsx",
      rows.map((r) => ({
        نام: r.name, "شماره تماس": r.phone, نوع: r.type, "تاریخ / ساعت": r.date,
        یادداشت: r.note, وضعیت: r.status,
      })),
      "تماس‌ها"
    );
  };

  const toggleCall = async (c) => {
    try {
      const updated = await api.toggleCall(c.id);
      setCalls((cs) => cs.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) { alert(err.message); }
  };

  const removeCall = async (c) => {
    if (!window.confirm(`آیا از حذف تماس «${c.name}» مطمئن هستید؟`)) return;
    try {
      await api.deleteCall(c.id);
      setCalls((cs) => cs.filter((x) => x.id !== c.id));
      setSelected((prev) => { const next = new Set(prev); next.delete(c.id); return next; });
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <PageHead title="CRM — مدیریت تماس‌ها" sub="تماس‌های ورودی، خروجی و برنامه‌ریزی‌شده"
        action={
          <div className="cmd-toolbar">
            <div className="cmd-search-input">
              <Search size={14} />
              <input className="input" placeholder="جستجوی نام یا شماره تماس..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-ghost" onClick={exportCalls}><Download size={14} />خروجی اکسل{selected.size > 0 ? ` (${selected.size})` : ""}</button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} />تماس جدید</button>
          </div>
        } />
      <div className="cmd-table-wrap">
        <table className="cmd-table">
          <thead><tr><th style={{ width: 34 }}><RowCheckbox checked={allFilteredSelected} onChange={toggleSelectAll} /></th><th>نام</th><th>شماره تماس</th><th>نوع</th><th>تاریخ / ساعت</th><th>یادداشت</th><th>زنگ زده شد؟</th>{isAdmin && <th></th>}</tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td><RowCheckbox checked={selected.has(c.id)} onChange={() => toggleSelected(c.id)} /></td>
                <td>{c.name}</td>
                <td style={{ direction: "ltr", textAlign: "right" }}>{c.phone}</td>
                <td><Badge tone={c.type === "ورودی" ? "blue" : c.type === "خروجی" ? "amber" : "gray"}>{c.type}</Badge></td>
                <td>{c.date}</td>
                <td style={{ whiteSpace: "normal", maxWidth: 220 }}>{c.note}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    style={{
                      background: c.status === "انجام‌شده" ? "var(--accent-soft)" : "var(--surface-2)",
                      color: c.status === "انجام‌شده" ? "var(--accent-dark)" : "var(--text-dim)",
                      border: c.status === "انجام‌شده" ? "1px solid rgba(127,192,40,0.35)" : "1px solid var(--border)",
                    }}
                    onClick={() => toggleCall(c)}
                    title={c.status === "انجام‌شده" ? "علامت‌گذاری به‌عنوان در انتظار" : "علامت‌گذاری به‌عنوان زنگ زده شده"}
                  >
                    <Check size={13} />{c.status === "انجام‌شده" ? "زنگ زده شد" : "در انتظار"}
                  </button>
                </td>
                {isAdmin && <td><button className="btn btn-sm btn-danger" onClick={() => removeCall(c)}><Trash2 size={13} /></button></td>}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={isAdmin ? 8 : 7} className="cmd-empty">موردی یافت نشد</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="ثبت تماس جدید" onClose={() => setShowModal(false)}>
          {err && <div className="cmd-login-error">{err}</div>}
          <div className="field-row">
            <div className="field"><label>نام</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>شماره تماس</label><input className="input" style={{ direction: "ltr" }} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="field-row">
            <div className="field"><label>نوع تماس</label>
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>ورودی</option><option>خروجی</option><option>برنامه‌ریزی‌شده</option>
              </select>
            </div>
            <div className="field"><label>تاریخ / ساعت</label><input className="input" placeholder="۱۴۰۳/۰۵/۲۵ - ۱۰:۰۰" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="field"><label>یادداشت</label><textarea className="textarea" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          <button className="btn btn-primary btn-block" onClick={addCall}>ثبت تماس</button>
        </Modal>
      )}
    </div>
  );
}
