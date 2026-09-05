import React, { useState } from "react";
import { Leaf, LogIn, Sun, Moon, Search, Truck } from "lucide-react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { api } from "../api";
import { GrowthTimeline, Badge, stageTone, ORDER_STAGES } from "../components/ui";

export default function Home() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginBusy(true);
    try {
      await login(username, password);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginBusy(false);
    }
  };

  // Guest tracking state
  const [code, setCode] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [trackBusy, setTrackBusy] = useState(false);

  const submitTrack = async (e) => {
    e.preventDefault();
    setTrackError("");
    setTrackBusy(true);
    try {
      const r = await api.trackOrder(code.trim());
      setTrackResult(r);
    } catch (err) {
      setTrackResult(null);
      setTrackError(err.message);
    } finally {
      setTrackBusy(false);
    }
  };

  return (
    <div className="cmd-home-wrap">
      <div className="cmd-home-inner">
        <div className="cmd-home-header">
          <div className="cmd-home-brand">
            <div className="cmd-login-icon"><Leaf size={22} /></div>
            <div>
              <div className="cmd-home-brand-title">قارچ روم</div>
              <div className="cmd-home-brand-sub">سامانه مدیریت شرکت</div>
            </div>
          </div>
          <button type="button" className="cmd-theme-toggle" onClick={toggleTheme} title="تغییر حالت روشن/تیره">
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        <div className="cmd-home-grid">
          {/* Login card */}
          <form className="cmd-home-card" onSubmit={submitLogin}>
            <div className="cmd-home-card-title">ورود اعضای تیم</div>
            <div className="cmd-home-card-sub">برای کارمندان، مدیریت و سازنده سامانه</div>

            {loginError && <div className="cmd-login-error">{loginError}</div>}

            <div className="field">
              <label>نام کاربری</label>
              <input className="input" style={{ direction: "ltr", textAlign: "right" }} value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="field">
              <label>رمز عبور</label>
              <input className="input" type="password" style={{ direction: "ltr", textAlign: "right" }} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" disabled={loginBusy}>
              <LogIn size={15} /> {loginBusy ? "در حال ورود..." : "ورود"}
            </button>
          </form>

          {/* Guest tracking card */}
          <div className="cmd-home-card">
            <div className="cmd-home-card-title">رهگیری سفارش</div>
            <div className="cmd-home-card-sub">کد رهگیری‌تان را وارد کنید تا وضعیت سفارش را ببینید — بدون نیاز به ورود</div>

            <form onSubmit={submitTrack} style={{ display: "flex", gap: 8 }}>
              <input className="input" style={{ direction: "ltr" }} placeholder="مثلاً TRK-1401-1234" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className="btn btn-primary" disabled={trackBusy}><Search size={14} /></button>
            </form>

            {trackError && <div className="cmd-login-error" style={{ marginTop: 14 }}>{trackError}</div>}

            {trackResult && (
              <div className="cmd-home-result">
                <div className="cmd-track-hero" style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12 }}>کد رهگیری</div>
                  <div className="cmd-track-code">{trackResult.trackingCode}</div>
                </div>
                <GrowthTimeline stage={trackResult.stage} />
                <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-dim)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <span>محصول: {trackResult.product} — نوع: {trackResult.type}</span>
                  <Badge tone={stageTone(trackResult.stage)}>{ORDER_STAGES[trackResult.stage]}</Badge>
                </div>
              </div>
            )}

            {!trackResult && !trackError && (
              <div className="cmd-empty" style={{ padding: "28px 10px" }}>
                <Truck size={26} />
                <div>کد رهگیری سفارش خود را از فاکتور یا پیامک تأیید سفارش پیدا کنید</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
