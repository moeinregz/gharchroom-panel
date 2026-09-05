import React from "react";
import { X, Sprout, Leaf, Package, Truck, BadgeCheck } from "lucide-react";
import * as XLSX from "xlsx";

export const ROLES = {
  admin: "سازنده",
  manager: "مدیر",
  sales: "کارشناس فروش",
  accounting: "حسابداری",
  seo: "کارشناس سئو",
  editor: "ادیتور",
  customer: "مشتری",
};

export const ORDER_STAGES = ["ثبت سفارش", "تایید سفارش", "ارسال از مبدا", "به مقصد رسید", "تحویل داده شد"];
export const ORDER_TYPES = ["کمپوست", "خاک پوششی", "محصولات صنعتی", "بسته‌بندی"];
export const stageTone = (stage) => ["gray", "blue", "amber", "blue", "green"][stage] || "gray";

export const Avatar = ({ name, size = 36 }) => {
  const initials = name?.split(" ").map((p) => p[0]).slice(0, 2).join("") || "?";
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
};

export const Badge = ({ children, tone = "gray" }) => <span className={`badge badge-${tone}`}>{children}</span>;

export function GrowthTimeline({ stage }) {
  const pct = (stage / (ORDER_STAGES.length - 1)) * 100;
  const icons = [Sprout, Leaf, Package, Truck, BadgeCheck];
  return (
    <div className="cmd-growth">
      <div className="cmd-growth-line" />
      <div className="cmd-growth-line-fill" style={{ width: `${pct}%` }} />
      {ORDER_STAGES.map((label, i) => {
        const Icon = icons[i];
        const state = i < stage ? "done" : i === stage ? "current" : "";
        return (
          <div key={label} className={`cmd-growth-step ${state}`}>
            <div className="cmd-growth-dot"><Icon size={17} /></div>
            <div className="cmd-growth-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function exportCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const header = Object.keys(rows[0]).join(",");
  const body = rows.map((r) => Object.values(r).map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const csv = "\uFEFF" + header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Real .xlsx export (SheetJS) — filename should end in .xlsx
export function exportExcel(filename, rows, sheetName = "Sheet1") {
  if (!rows || !rows.length) return;
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename, { bookType: "xlsx" });
}

// Checkbox for row-selection tables/cards
export const RowCheckbox = ({ checked, onChange }) => (
  <input
    type="checkbox"
    checked={checked}
    onClick={(e) => e.stopPropagation()}
    onChange={onChange}
    style={{ width: 16, height: 16, cursor: "pointer" }}
  />
);


export const Modal = ({ title, onClose, children, width }) => (
  <div className="cmd-overlay" onClick={onClose}>
    <div className="cmd-modal" style={width ? { maxWidth: width } : undefined} onClick={(e) => e.stopPropagation()}>
      <div className="cmd-modal-head">
        <div className="card-title">{title}</div>
        <button className="cmd-modal-close" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="cmd-modal-body">{children}</div>
    </div>
  </div>
);

export function PageHead({ title, sub, action }) {
  return (
    <div className="cmd-page-head">
      <div>
        <div className="cmd-page-title">{title}</div>
        {sub && <div className="cmd-page-sub">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

const toneMap = {
  green: ["var(--accent-soft)", "var(--accent)"],
  blue: ["var(--info-soft)", "var(--info)"],
  amber: ["var(--warning-soft)", "var(--warning)"],
  info: ["var(--info-soft)", "var(--info)"],
};
export function StatCard({ icon: Icon, label, value, tone }) {
  const [bg, fg] = toneMap[tone] || toneMap.green;
  return (
    <div className="cmd-stat-card">
      <div className="cmd-stat-icon" style={{ background: bg, color: fg }}><Icon size={18} /></div>
      <div className="cmd-stat-val">{value}</div>
      <div className="cmd-stat-label">{label}</div>
    </div>
  );
}

export function Loading({ text = "در حال بارگذاری..." }) {
  return <div className="cmd-loading">{text}</div>;
}
