import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../api";
import { Badge, PageHead, GrowthTimeline, Loading, stageTone, ORDER_STAGES } from "../components/ui";

export function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.listOrders().then(setOrders).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;

  return (
    <div>
      <PageHead title="سفارش‌های من" sub="تاریخچه و وضعیت سفارش‌های ثبت‌شده شما" />
      {orders.length === 0 && <div className="cmd-empty">هنوز سفارشی برای شما ثبت نشده است.</div>}
      {orders.map((o) => (
        <div className="card" key={o.id} style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div>
              <div className="card-title">{o.product}</div>
              <div className="card-title-sub">ثبت‌شده در {o.sendDate}</div>
            </div>
            <Badge tone={stageTone(o.stage)}>{ORDER_STAGES[o.stage]}</Badge>
          </div>
          <GrowthTimeline stage={o.stage} />
        </div>
      ))}
    </div>
  );
}

export function Tracking() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const search = async () => {
    setError("");
    try {
      const r = await api.trackOrder(code.trim());
      setResult(r);
    } catch (e) { setResult(null); setError(e.message); }
  };

  return (
    <div>
      <PageHead title="رهگیری سفارش" sub="کد رهگیری خود را برای مشاهده وضعیت وارد کنید" />
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="input" style={{ direction: "ltr" }} placeholder="مثلاً TRK-1401-1234" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} />
          <button className="btn btn-primary" onClick={search}><Search size={14} />رهگیری</button>
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 10 }}>{error}</div>}
      </div>
      {result && (
        <div className="card">
          <div className="cmd-track-hero" style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>کد رهگیری</div>
            <div className="cmd-track-code">{result.trackingCode}</div>
          </div>
          <GrowthTimeline stage={result.stage} />
          <div style={{ marginTop: 18, fontSize: 12.5, color: "var(--text-dim)" }}>محصول: {result.product} — نوع: {result.type}</div>
        </div>
      )}
    </div>
  );
}
