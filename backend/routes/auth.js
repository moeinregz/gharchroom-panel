const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../db");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "نام کاربری و رمز عبور الزامی است" });

  const db = await getDB();
  const user = db.users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است" });
  }

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "12h" });
  const { passwordHash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.get("/me", requireAuth, async (req, res) => {
  const db = await getDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;
