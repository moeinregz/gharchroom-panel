const express = require("express");
const { getDB, saveDB, nextId } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("sales"));

router.get("/", async (req, res) => {
  const db = await getDB();
  res.json(db.notes.filter((n) => n.userId === req.user.id));
});

router.post("/", async (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: "متن یادداشت خالی است" });
  const db = await getDB();
  const note = { id: nextId(db, "notes"), userId: req.user.id, text };
  db.notes.unshift(note);
  await saveDB(db);
  res.status(201).json(note);
});

router.delete("/:id", async (req, res) => {
  const db = await getDB();
  const note = db.notes.find((n) => n.id === Number(req.params.id) && n.userId === req.user.id);
  if (!note) return res.status(404).json({ error: "یادداشت یافت نشد" });
  db.notes = db.notes.filter((n) => n.id !== note.id);
  await saveDB(db);
  res.json({ ok: true });
});

module.exports = router;
