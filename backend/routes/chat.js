const express = require("express");
const multer = require("multer");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const { getDB, saveDB, nextId } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// NOTE: Vercel's filesystem is read-only except for /tmp, and /tmp is wiped
// between invocations — so uploaded files will NOT persist reliably in
// production. This keeps uploads working locally without crashing on Vercel.
// For real persistence, swap this for Vercel Blob / S3 / Cloudinary.
const uploadDir = path.join(os.tmpdir(), "uploads", "chat");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${uuid()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

async function assertCanChat(req, res) {
  const db = await getDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (user && user.chatEnabled === false) {
    res.status(403).json({ error: "دسترسی شما به گفتگو توسط مدیریت غیرفعال شده است" });
    return null;
  }
  return db;
}

function withNames(db, messages) {
  return messages.map((m) => ({ ...m, senderName: db.users.find((u) => u.id === m.sender)?.name || "کاربر" }));
}

router.get("/messages", async (req, res) => {
  const db = await getDB();
  res.json(withNames(db, db.chatMessages));
});

router.post("/messages", async (req, res) => {
  const db = await assertCanChat(req, res);
  if (!db) return;
  const { text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: "متن پیام خالی است" });

  const msg = { id: nextId(db, "chat"), sender: req.user.id, text, time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }), file: null };
  db.chatMessages.push(msg);
  await saveDB(db);
  res.status(201).json({ ...msg, senderName: req.user.name });
});

router.post("/upload", upload.single("file"), async (req, res) => {
  const db = await assertCanChat(req, res);
  if (!db) return;
  if (!req.file) return res.status(400).json({ error: "فایلی ارسال نشده است" });

  const msg = {
    id: nextId(db, "chat"), sender: req.user.id, text: "یک فایل ارسال کرد:",
    time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    file: req.file.originalname, fileUrl: `/uploads/chat/${req.file.filename}`,
  };
  db.chatMessages.push(msg);
  await saveDB(db);
  res.status(201).json({ ...msg, senderName: req.user.name });
});

module.exports = router;
