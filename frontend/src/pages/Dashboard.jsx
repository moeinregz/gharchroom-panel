import React, { useEffect, useState } from "react";
import { ShoppingCart, CheckSquare, Phone, Users, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { api } from "../api";
import { useTheme } from "../ThemeContext";
import { Badge, StatCard, PageHead, GrowthTimeline, Loading, stageTone, ORDER_STAGES } from "../components/ui";

export default function Dashboard({ user }) {
  const { theme } = useTheme();
  const chartColors = theme === "dark"
    ? { axis: "#8A8A8F", tooltipBg: "#141414", tooltipBorder: "rgba(255,255,255,0.16)", grid: "rgba(255,255,255,0.07)", bar: "#FFFFFF" }
    : { axis: "#8A8A8F", tooltipBg: "#FFFFFF", tooltipBorder: "rgba(10,10,10,0.14)", grid: "rgba(10,10,10,0.06)", bar: "#0A0A0A" };
  const isBoss = user.role === "admin" || user.role === "manager";
  const canSeeCrm = ["admin", "manager", "sales"].includes(user.role);

  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [crmCalls, setCrmCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listTasks().catch(() => []),
      api.listOrders().catch(() => []),
      isBoss ? api.listUsers().catch(() => []) : Promise.resolve([]),
      canSeeCrm ? api.listCalls().catch(() => []) : Promise.resolve([]),
    ]).then(([t, o, e, c]) => {
      setTasks(t); setOrders(o); setEmployees(e); setCrmCalls(c); setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  if (user.role === "customer") {
    const myOrder = orders[0];
    return (
      <div>
        <PageHead title="داشبورد مشتری" sub="وضعیت سفارش و اطلاعات حساب شما" />
        {myOrder ? (
          <>
            <div className="cmd-track-hero" style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13 }}>کد رهگیری آخرین سفارش شما</div>
              <div className="cmd-track-code">{myOrder.trackingCode}</div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">وضعیت سفارش</div></div>
              <GrowthTimeline stage={myOrder.stage} />
            </div>
          </>
        ) : <div className="cmd-empty">هنوز سفارشی برای شما ثبت نشده است.</div>}
      </div>
    );
  }

  const pendingCalls = crmCalls.filter((c) => c.status === "در انتظار").length;

  // Real distribution of orders by type — replaces the previous placeholder weekly chart
  const typeCounts = {};
  orders.forEach((o) => { typeCounts[o.type] = (typeCounts[o.type] || 0) + 1; });
  const typeData = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

  return (
    <div>
      <PageHead title={`سلام ${user.name?.split(" ")[0] || ""} 👋`} sub="خلاصه‌ای از وضعیت امروز شرکت" />

      <div className="cmd-stat-grid">
        <StatCard icon={ShoppingCart} tone="green" label="سفارش‌های فعال" value={orders.filter((o) => o.stage < 4).length} />
        <StatCard icon={CheckSquare} tone="blue" label={isBoss ? "وظایف باز کل تیم" : "وظایف باز من"} value={tasks.filter((t) => t.status === "todo").length} />
        {canSeeCrm ? (
          <StatCard icon={Phone} tone="amber" label="تماس‌های در انتظار CRM" value={pendingCalls} />
        ) : (
          <StatCard icon={ShoppingCart} tone="amber" label="کل سفارش‌های ثبت‌شده" value={orders.length} />
        )}
        {isBoss ? (
          <StatCard icon={Users} tone="info" label="اعضای فعال تیم" value={employees.length} />
        ) : (
          <StatCard icon={Clock} tone="info" label="تسک‌های انجام‌شده من" value={tasks.filter((t) => t.status === "done").length} />
        )}
      </div>

      <div className="cmd-two-col">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">وظایف اخیر</div>
              <div className="card-title-sub">{isBoss ? "برای همه اعضای تیم" : "وظایف اختصاص‌یافته به شما"}</div>
            </div>
          </div>
          {tasks.slice(0, 5).map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>موعد: {t.due}</div>
              </div>
              <Badge tone={t.status === "done" ? "green" : "amber"}>{t.status === "done" ? "انجام شد" : "در جریان"}</Badge>
            </div>
          ))}
          {tasks.length === 0 && <div className="cmd-empty">تسکی وجود ندارد</div>}
        </div>

        {isBoss ? (
          <div className="card">
            <div className="card-head"><div className="card-title">سفارش‌ها بر اساس نوع محصول</div></div>
            {typeData.length === 0 ? (
              <div className="cmd-empty">هنوز سفارشی ثبت نشده</div>
            ) : (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="type" stroke={chartColors.axis} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke={chartColors.axis} fontSize={11} tickLine={false} axisLine={false} width={24} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 12, fontFamily: "Vazirmatn", fontSize: 12 }} cursor={{ fill: "rgba(128,128,128,0.08)" }} />
                    <Bar dataKey="count" fill={chartColors.bar} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="card-head"><div className="card-title">آخرین سفارش‌های ثبت‌شده</div></div>
            {orders.slice(0, 4).map((o) => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12.5 }}>{o.name}</div>
                <Badge tone={stageTone(o.stage)}>{ORDER_STAGES[o.stage]}</Badge>
              </div>
            ))}
            {orders.length === 0 && <div className="cmd-empty">سفارشی ثبت نشده</div>}
          </div>
        )}
      </div>
    </div>
  );
}
