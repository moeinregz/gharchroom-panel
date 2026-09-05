import React, { useEffect, useState } from "react";
import { LogIn, LogOut, Download, ShieldCheck } from "lucide-react";
import { api } from "../api";
import { PageHead, Loading, exportCSV } from "../components/ui";

export default function Attendance({ user }) {
  const isBoss = user.role === "admin" || user.role === "manager";
  const [mine, setMine] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = () => {
    Promise.all([api.myAttendance(), isBoss ? api.listAttendance() : Promise.resolve([])])
      .then(([m, a]) => { setMine(m); setAll(a); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const today = mine.find((r) => r.out === "—") || mine[0];

  const clockIn = async () => {
    setErr("");
    try { const r = await api.clockIn(); setMine((m) => [r, ...m]); if (isBoss) setAll((a) => [r, ...a]); }
    catch (e) { setErr(e.message); }
  };
  const clockOut = async () => {
    setErr("");
    try {
      const r = await api.clockOut();
      setMine((m) => m.map((x) => (x.id === r.id ? r : x)));
      if (isBoss) setAll((a) => a.map((x) => (x.id === r.id ? r : x)));
    } catch (e) { setErr(e.message); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHead title="حضور و غیاب" sub={isBoss ? "ثبت ورود و خروج و مشاهده گزارش کل تیم" : "ثبت زمان ورود و خروج شما"} />

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head"><div className="card-title">ثبت امروز — {user.name}</div></div>
        {err && <div className="cmd-login-error">{err}</div>}
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-faint)" }}>زمان ورود</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)" }}>{today?.in || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-faint)" }}>زمان خروج</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{today && today.out !== "—" ? today.out : "—"}</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginRight: "auto" }}>
            <button className="btn btn-primary" disabled={!!today && today.out === "—"} onClick={clockIn}><LogIn size={14} />ثبت ورود</button>
            <button className="btn btn-danger" disabled={!today || today.out !== "—"} onClick={clockOut}><LogOut size={14} />ثبت خروج</button>
          </div>
        </div>
      </div>

      {isBoss ? (
        <div className="card">
          <div className="card-head">
            <div className="card-title">گزارش حضور و غیاب تیم <span style={{ fontWeight: 400, color: "var(--text-faint)" }}>(فقط قابل مشاهده برای مدیر و سازنده)</span></div>
            <button className="btn btn-ghost btn-sm" onClick={() => exportCSV("attendance.csv", all)}><Download size={13} />خروجی اکسل</button>
          </div>
          <div className="cmd-table-wrap">
            <table className="cmd-table">
              <thead><tr><th>نام</th><th>تاریخ</th><th>ورود</th><th>خروج</th></tr></thead>
              <tbody>{all.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.date}</td><td>{r.in}</td><td>{r.out}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="cmd-empty"><ShieldCheck size={26} /><div>سوابق حضور و غیاب تنها برای مدیر و سازنده قابل نمایش است.</div></div>
      )}
    </div>
  );
}
