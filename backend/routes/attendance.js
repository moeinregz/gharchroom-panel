const express = require("express");
const { getDB, saveDB, nextId } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Full log — admin & manager only
router.get("/", requireRole("admin", "manager"), async (req, res) => {
  const db = await getDB();
  res.json(db.attendance);
});

// The logged-in user's own records
router.get("/me", async (req, res) => {
  const db = await getDB();
  res.json(db.attendance.filter((a) => a.userId === req.user.id));
});

router.post("/clock-in", async (req, res) => {
  const db = await getDB();
  const time = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  const date = new Date().toLocaleDateString("fa-IR");
  const record = { id: nextId(db, "notes") + 100000, userId: req.user.id, name: req.user.name, date, in: time, out: "—" };
  db.attendance.unshift(record);
  await saveDB(db);
  res.status(201).json(record);
});

router.post("/clock-out", async (req, res) => {
  const db = await getDB();
  const time = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  const today = db.attendance.find((a) => a.userId === req.user.id && a.out === "—");
  if (!today) return res.status(400).json({ error: "ابتدا باید ورود خود را ثبت کنید" });
  today.out = time;
  await saveDB(db);
  res.json(today);
});

module.exports = router;
