import React, { useEffect, useState } from "react";
import { Plus, Download, Eye, FileText, Printer, Trash2, Search } from "lucide-react";
import { api } from "../api";
import { Badge, PageHead, Modal, GrowthTimeline, Loading, exportCSV, stageTone, ORDER_STAGES, ORDER_TYPES } from "../components/ui";

const emptyOrder = { name: "", phone: "", nid: "", address: "", postal: "", type: ORDER_TYPES[0], product: "", sendDate: "", deposit: "", total: "" };

export default function Orders({ user }) {
  const isAdmin = user?.role === "admin";
  const canChangeStage = ["admin", "manager", "sales", "accounting"].includes(user?.role);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [stageBusy, setStageBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [filterType, setFilterType] = useState("همه");
  const [form, setForm] = useState(emptyOrder);
  const [err, setErr] = useState("");

  const load = () => api.listOrders().then(setOrders).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = orders
    .filter((o) => filterType === "همه" || o.type === filterType)
    .filter((o) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return [o.name, o.phone, o.product, o.trackingCode].some((v) => (v || "").toLowerCase().includes(q));
    });

  const addOrder = async () => {
    setErr("");
    if (!form.name.trim() || !form.phone.trim()) return;
    try {
      const o = await api.createOrder(form);
      setOrders((os) => [o, ...os]);
      setShowForm(false);
      setForm(emptyOrder);
    } catch (e) { setErr(e.message); }
  };

  const removeOrder = async (o) => {
    if (!window.confirm(`آیا از حذف سفارش «${o.name}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`)) return;
    try {
      await api.deleteOrder(o.id);
      setOrders((os) => os.filter((x) => x.id !== o.id));
      setDetail((d) => (d?.id === o.id ? null : d));
    } catch (err) { alert(err.message); }
  };

  const changeStage = async (order, stage) => {
    setStageBusy(true);
    try {
      const updated = await api.updateOrderStage(order.id, Number(stage));
      setOrders((os) => os.map((x) => (x.id === updated.id ? updated : x)));
      setDetail((d) => (d?.id === updated.id ? updated : d));
    } catch (err) { alert(err.message); }
    finally { setStageBusy(false); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHead title="مدیریت سفارش‌ها" sub="ثبت، پیگیری و صدور فاکتور سفارش‌های مشتریان"
        action={
          <div className="cmd-toolbar">
            <div className="cmd-search-input">
              <Search size={14} />
              <input className="input" placeholder="جستجوی نام، تلفن، محصول یا کد رهگیری..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="select" style={{ width: "auto" }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option>همه</option>
              {ORDER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <button className="btn btn-ghost" onClick={() => exportCSV("orders.csv", filtered.map(({ id, ...r }) => r))}><Download size={14} />خروجی اکسل</button>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={14} />ثبت سفارش جدید</button>
          </div>
        } />

      <div className="cmd-table-wrap">
        <table className="cmd-table">
          <thead><tr><th>مشتری</th><th>نوع سفارش</th><th>محصول</th><th>زمان ارسال</th><th>مبلغ کل</th><th>وضعیت</th><th>کد رهگیری</th><th></th></tr></thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>{o.name}</td>
                <td><Badge tone="gray">{o.type}</Badge></td>
                <td style={{ whiteSpace: "normal", maxWidth: 200 }}>{o.product}</td>
                <td>{o.sendDate}</td>
                <td>{o.total} تومان</td>
                <td>
                  {canChangeStage ? (
                    <select className="select" style={{ width: "auto", padding: "5px 8px", fontSize: 11.5 }} value={o.stage} disabled={stageBusy} onChange={(e) => changeStage(o, e.target.value)}>
                      {ORDER_STAGES.map((s, i) => <option key={s} value={i}>{s}</option>)}
                    </select>
                  ) : (
                    <Badge tone={stageTone(o.stage)}>{ORDER_STAGES[o.stage]}</Badge>
                  )}
                </td>
                <td style={{ direction: "ltr", textAlign: "right", fontFamily: "monospace" }}>{o.trackingCode}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => setDetail(o)}><Eye size={13} /></button>
                    <button className="btn btn-sm btn-ghost" onClick={() => setInvoice(o)}><FileText size={13} /></button>
                    {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => removeOrder(o)}><Trash2 size={13} /></button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="cmd-empty">سفارشی ثبت نشده</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="ثبت سفارش جدید" onClose={() => setShowForm(false)} width={640}>
          {err && <div className="cmd-login-error">{err}</div>}
          <div className="field-row">
            <div className="field"><label>نام و نام خانوادگی</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>شماره تماس</label><input className="input" style={{ direction: "ltr" }} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="field-row">
            <div className="field"><label>کد ملی</label><input className="input" style={{ direction: "ltr" }} value={form.nid} onChange={(e) => setForm({ ...form, nid: e.target.value })} /></div>
            <div className="field"><label>کد پستی</label><input className="input" style={{ direction: "ltr" }} value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} /></div>
          </div>
          <div className="field"><label>آدرس</label><textarea className="textarea" style={{ minHeight: 56 }} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="field-row">
            <div className="field"><label>نوع سفارش</label>
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {ORDER_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>نام محصول</label><input className="input" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} /></div>
          </div>
          <div className="field-row">
            <div className="field"><label>زمان ارسال</label><input className="input" placeholder="۱۴۰۳/۰۶/۰۱" value={form.sendDate} onChange={(e) => setForm({ ...form, sendDate: e.target.value })} /></div>
            <div className="field"><label>مقدار بیعانه (تومان)</label><input className="input" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} /></div>
          </div>
          <div className="field"><label>هزینه کل (تومان)</label><input className="input" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} /></div>
          <button className="btn btn-primary btn-block" onClick={addOrder}>ثبت سفارش و صدور کد رهگیری</button>
        </Modal>
      )}

      {detail && (
        <Modal title={`جزئیات سفارش — ${detail.name}`} onClose={() => setDetail(null)} width={640}>
          <div className="cmd-track-hero" style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>کد رهگیری</div>
            <div className="cmd-track-code">{detail.trackingCode}</div>
          </div>
          <GrowthTimeline stage={detail.stage} />
          {canChangeStage && (
            <div className="field" style={{ marginTop: 16 }}>
              <label>تغییر مرحله سفارش</label>
              <select className="select" value={detail.stage} disabled={stageBusy} onChange={(e) => changeStage(detail, e.target.value)}>
                {ORDER_STAGES.map((s, i) => <option key={s} value={i}>{s}</option>)}
              </select>
            </div>
          )}
          <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12.5 }}>
            <DetailRow label="شماره تماس" value={detail.phone} ltr />
            <DetailRow label="کد ملی" value={detail.nid} ltr />
            <DetailRow label="کد پستی" value={detail.postal} ltr />
            <DetailRow label="نوع سفارش" value={detail.type} />
            <DetailRow label="محصول" value={detail.product} />
            <DetailRow label="زمان ارسال" value={detail.sendDate} />
            <DetailRow label="بیعانه" value={`${detail.deposit} تومان`} />
            <DetailRow label="هزینه کل" value={`${detail.total} تومان`} />
            <DetailRow label="ثبت‌شده توسط" value={detail.registeredBy} />
            <DetailRow label="آدرس" value={detail.address} />
          </div>
          {isAdmin && (
            <button className="btn btn-danger btn-block" style={{ marginTop: 18 }} onClick={() => removeOrder(detail)}>
              <Trash2 size={14} />حذف این سفارش
            </button>
          )}
        </Modal>
      )}

      {invoice && <InvoiceModal order={invoice} onClose={() => setInvoice(null)} />}
    </div>
  );
}

function DetailRow({ label, value, ltr }) {
  return (
    <div>
      <div style={{ color: "var(--text-faint)", fontSize: 11 }}>{label}</div>
      <div style={{ marginTop: 2, direction: ltr ? "ltr" : "rtl", textAlign: ltr ? "right" : "inherit" }}>{value}</div>
    </div>
  );
}

function InvoiceModal({ order, onClose }) {
  return (
    <Modal title="فاکتور فروش" onClose={onClose} width={520}>
      <div style={{ background: "#fff", color: "#111", borderRadius: 12, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0A0A0A", paddingBottom: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>قارچ روم</div>
            <div style={{ fontSize: 11, color: "#666" }}>تولید کمپوست، خاک پوششی و محصولات صنعتی</div>
          </div>
          <div style={{ fontSize: 11, textAlign: "left" }}>
            <div>شماره فاکتور: {order.id}</div>
            <div>تاریخ: {order.sendDate}</div>
          </div>
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 2 }}>
          <div><b>خریدار:</b> {order.name}</div>
          <div><b>تماس:</b> {order.phone}</div>
          <div><b>آدرس:</b> {order.address}</div>
          <div><b>کد ملی:</b> {order.nid} — <b>کد پستی:</b> {order.postal}</div>
        </div>
        <table style={{ width: "100%", marginTop: 14, borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead><tr style={{ background: "#f0f0f0" }}><th style={{ padding: 8, textAlign: "right" }}>شرح کالا</th><th style={{ padding: 8 }}>نوع</th><th style={{ padding: 8 }}>مبلغ (تومان)</th></tr></thead>
          <tbody>
            <tr><td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>{order.product}</td><td style={{ padding: 8, borderBottom: "1px solid #ddd", textAlign: "center" }}>{order.type}</td><td style={{ padding: 8, borderBottom: "1px solid #ddd", textAlign: "center" }}>{order.total}</td></tr>
          </tbody>
        </table>
        <div style={{ marginTop: 12, fontSize: 12.5, textAlign: "left" }}>
          <div>بیعانه دریافتی: {order.deposit} تومان</div>
          <div style={{ fontWeight: 800, marginTop: 4 }}>مبلغ کل: {order.total} تومان</div>
        </div>
        <div style={{ marginTop: 16, fontSize: 10.5, color: "#888", textAlign: "center" }}>کد رهگیری: {order.trackingCode}</div>
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={() => window.print()}><Printer size={14} />چاپ فاکتور</button>
    </Modal>
  );
}
