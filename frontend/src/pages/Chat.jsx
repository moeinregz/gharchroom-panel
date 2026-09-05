import React, { useEffect, useRef, useState } from "react";
import { Paperclip, Send, Lock } from "lucide-react";
import { api } from "../api";
import { Avatar, PageHead, Loading } from "../components/ui";

export default function Chat({ user }) {
  const [employees, setEmployees] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const fileRef = useRef();
  const msgsRef = useRef();

  const canSee = ["admin", "manager"].includes(user.role);

  const load = () => {
    Promise.all([canSee ? api.listUsers() : Promise.resolve([]), api.listMessages()])
      .then(([e, m]) => { setEmployees(e); setMessages(m); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { msgsRef.current?.scrollTo(0, msgsRef.current.scrollHeight); }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    setErr("");
    try {
      const m = await api.sendMessage(text);
      setMessages((c) => [...c, m]);
      setText("");
    } catch (e) { setErr(e.message); }
  };

  const attach = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr("");
    try {
      const m = await api.uploadFile(f);
      setMessages((c) => [...c, m]);
    } catch (er) { setErr(er.message); }
    e.target.value = "";
  };

  if (loading) return <Loading />;
  const canSend = user.chatEnabled !== false;

  return (
    <div>
      <PageHead title="گفتگوی تیمی" sub="فضای اشتراک‌گذاری اطلاعات و فایل بین اعضا" />
      <div className={`cmd-chat ${canSee ? "" : "cmd-chat-solo"}`}>
        {canSee && (
          <div className="card cmd-chat-list">
            <div className="card-title" style={{ marginBottom: 10 }}>اعضا</div>
            {employees.map((e) => (
              <div key={e.id} className={`cmd-chat-user ${!e.chatEnabled ? "blocked" : ""}`}>
                <Avatar name={e.name} size={26} />
                <div style={{ minWidth: 0, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</div>
                {!e.chatEnabled && <Lock size={12} color="var(--danger)" />}
              </div>
            ))}
          </div>
        )}
        <div className="cmd-chat-body">
          <div className="cmd-chat-msgs" ref={msgsRef}>
            {messages.map((m) => {
              const isMe = m.sender === user.id;
              return (
                <div key={m.id} className={`cmd-bubble ${isMe ? "me" : ""}`}>
                  {!isMe && <div className="cmd-bubble-meta">{m.senderName || "کاربر"}</div>}
                  {m.text}
                  {m.file && (
                    <div className="cmd-bubble-file">
                      <Paperclip size={12} />
                      {m.fileUrl ? <a href={m.fileUrl} target="_blank" rel="noreferrer">{m.file}</a> : m.file}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 5 }}>{m.time}</div>
                </div>
              );
            })}
            {messages.length === 0 && <div className="cmd-empty">هنوز پیامی ارسال نشده</div>}
          </div>

          {err && <div className="cmd-login-error" style={{ margin: "0 14px 10px" }}>{err}</div>}

          {!canSend ? (
            <div style={{ padding: 14, textAlign: "center", fontSize: 12.5, color: "var(--danger)", borderTop: "1px solid var(--border)" }}>
              <Lock size={13} style={{ verticalAlign: "-2px" }} /> دسترسی شما به گفتگو توسط مدیریت غیرفعال شده است.
            </div>
          ) : (
            <div className="cmd-chat-input">
              <input ref={fileRef} type="file" style={{ display: "none" }} onChange={attach} />
              <button className="cmd-icon-btn" onClick={() => fileRef.current?.click()}><Paperclip size={16} /></button>
              <input placeholder="پیام خود را بنویسید..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
              <button className="cmd-icon-btn" onClick={send}><Send size={16} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
