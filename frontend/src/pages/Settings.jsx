import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Avatar, PageHead, Loading } from "../components/ui";

export default function Settings() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.listUsers().then(setEmployees).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggle = async (e) => {
    const updated = await api.updateUser(e.id, { chatEnabled: !e.chatEnabled });
    setEmployees((es) => es.map((x) => (x.id === e.id ? updated : x)));
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHead title="دسترسی گفتگو" sub="فعال یا غیرفعال‌کردن دسترسی چت برای هر یک از اعضا" />
      <div className="card">
        {employees.filter((e) => e.role !== "admin").map((e) => (
          <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={e.name} size={32} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{e.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{e.position}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11.5, color: e.chatEnabled ? "var(--accent)" : "var(--danger)" }}>{e.chatEnabled ? "دسترسی فعال" : "دسترسی مسدود"}</span>
              <div className={`cmd-switch ${e.chatEnabled ? "on" : ""}`} onClick={() => toggle(e)}><div className="cmd-switch-dot" /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
