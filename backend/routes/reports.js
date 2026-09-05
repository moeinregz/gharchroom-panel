const express = require("express");
const { getDB, saveDB, nextId } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const isBoss = (role) => role === "admin" || role === "manager";

router.get("/", async (req, res) => {
  const db = await getDB();
  const reports = isBoss(req.user.role) ? db.reports : db.reports.filter((r) => r.userId === req.user.id);
  res.json(reports);
});

router.post("/", async (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: "متن گزارش خالی است" });
  const db = await getDB();
  const report = { id: nextId(db, "reports"), userId: req.user.id, name: req.user.name, date: new Date().toLocaleDateString("fa-IR"), text };
  db.reports.unshift(report);
  await saveDB(db);
  res.status(201).json(report);
});

module.exports = router;
