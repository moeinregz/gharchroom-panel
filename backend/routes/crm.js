const express = require("express");
const { getDB, saveDB, nextId } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("admin", "manager", "sales"));

router.get("/", async (req, res) => {
  const db = await getDB();
  res.json(db.crmCalls);
});

router.post("/", async (req, res) => {
  const { name, phone, type, date, note, status } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "نام و شماره تماس الزامی است" });

  const db = await getDB();
  const call = { id: nextId(db, "crmCalls"), name, phone, type: type || "ورودی", date: date || "", note: note || "", status: status || "در انتظار" };
  db.crmCalls.unshift(call);
  await saveDB(db);
  res.status(201).json(call);
});

// Toggle call status (انجام‌شده / در انتظار) — any admin/manager/sales user
router.patch("/:id/toggle", async (req, res) => {
  const db = await getDB();
  const call = db.crmCalls.find((c) => c.id === Number(req.params.id));
  if (!call) return res.status(404).json({ error: "تماس یافت نشد" });
  call.status = call.status === "انجام‌شده" ? "در انتظار" : "انجام‌شده";
  await saveDB(db);
  res.json(call);
});

// Delete a call — admin (سازنده) only
router.delete("/:id", requireRole("admin"), async (req, res) => {
  const db = await getDB();
  const before = db.crmCalls.length;
  db.crmCalls = db.crmCalls.filter((c) => c.id !== Number(req.params.id));
  if (db.crmCalls.length === before) return res.status(404).json({ error: "تماس یافت نشد" });
  await saveDB(db);
  res.json({ ok: true });
});

module.exports = router;
