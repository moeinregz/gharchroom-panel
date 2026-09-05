const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "توکن ارسال نشده است" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, role, name }
    next();
  } catch (e) {
    return res.status(401).json({ error: "توکن نامعتبر یا منقضی شده است" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "احراز هویت نشده‌اید" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "شما دسترسی لازم برای این بخش را ندارید" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, JWT_SECRET };
