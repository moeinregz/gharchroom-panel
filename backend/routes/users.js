const express = require("express");
const bcrypt = require("bcryptjs");
const { getDB, saveDB, nextId } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const strip = (u) => { const { passwordHash, ...rest } = u; return rest; };

// List all employees (not customers) — admin & manager only
router.get("/", requireRole("admin", "manager"), async (req, res) => {
  const db = await getDB();
  res.json(db.users.filter((u) => u.role !== "customer").map(strip));
});

// Create a new employee — admin & manager only
router.post("/", requireRole("admin", "manager"), async (req, res) => {
  const { name, username, password, role, position, phone, email } = req.body || {};
  if (!name || !username || !password || !role) return res.status(400).json({ error: "اطلاعات ناقص است" });

  const db = await getDB();
  if (db.users.some((u) => u.username === username)) return res.status(409).json({ error: "این نام کاربری قبلاً استفاده شده است" });

  const user = {
    id: nextId(db, "users"),
    name, username, passwordHash: bcrypt.hashSync(password, 8),
    role, position: position || "", phone: phone || "", email: email || "",
    join: new Date().toLocaleDateString("fa-IR"), chatEnabled: true,
  };
  db.users.push(user);
  await saveDB(db);
  res.status(201).json(strip(user));
});

// Update an employee (profile fields and/or chatEnabled) — admin & manager only
router.patch("/:id", requireRole("admin", "manager"), async (req, res) => {
  const db = await getDB();
  const user = db.users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });

  const allowed = ["name", "position", "phone", "email", "role", "chatEnabled"];
  for (const key of allowed) if (key in req.body) user[key] = req.body[key];
  await saveDB(db);
  res.json(strip(user));
});

// Delete an employee — admin (سازنده) only
router.delete("/:id", requireRole("admin"), async (req, res) => {
  const db = await getDB();
  const id = Number(req.params.id);
  const user = db.users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });

  db.users = db.users.filter((u) => u.id !== id);
  await saveDB(db);
  res.json({ ok: true });
});

module.exports = router;
