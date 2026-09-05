import React, { useEffect, useState } from "react";
import { Send, FileText } from "lucide-react";
import { api } from "../api";
import { Avatar, PageHead, Loading } from "../components/ui";

export default function Reports({ user }) {
  const isBoss = user.role === "admin" || user.role === "manager";
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  const load = () => api.listReports().then(setReports).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!text.trim()) return;
    const r = await api.createReport(text);
    setReports((rs) => [r, ...rs]);
    setText("");
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHead title="گزارش‌های کاری" sub={isBoss ? "مشاهده گزارش کار همه اعضای تیم" : "ارسال گزارش کاری روزانه"} />
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title" style={{ marginBottom: 10 }}>ارسال گزارش جدید</div>
        <textarea className="textarea" placeholder="خلاصه فعالیت‌های امروز خود را بنویسید..." value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={send}><Send size={14} />ارسال گزارش</button>
      </div>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 10 }}>{isBoss ? "گزارش‌های دریافتی" : "گزارش‌های ارسالی من"}</div>
        {reports.map((r) => (
          <div key={r.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <Avatar name={r.name} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{r.date}</div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 4 }}>{r.text}</div>
            </div>
          </div>
        ))}
        {reports.length === 0 && <div className="cmd-empty"><FileText size={24} /><div>گزارشی ثبت نشده</div></div>}
      </div>
    </div>
  );
}
