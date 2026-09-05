const express = require("express");
const { getDB, saveDB, nextId, genTracking, ORDER_STAGES } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Public tracking endpoint — no authentication required, matches the customer tracking page
router.get("/track/:code", async (req, res) => {
  const db = await getDB();
  const order = db.orders.find((o) => o.trackingCode.toLowerCase() === req.params.code.toLowerCase());
  if (!order) return res.status(404).json({ error: "کد رهگیری یافت نشد" });
  res.json({ ...order, stages: ORDER_STAGES });
});

router.use(requireAuth);

// List orders — admin/manager/accounting see all, sales see all (needs to browse), customer sees only their own
router.get("/", async (req, res) => {
  const db = await getDB();
  if (req.user.role === "customer") {
    return res.json(db.orders.filter((o) => o.customerId === req.user.id));
  }
  if (!["admin", "manager", "sales", "accounting"].includes(req.user.role)) {
    return res.status(403).json({ error: "دسترسی مجاز نیست" });
  }
  res.json(db.orders);
});

// Register a new order — admin/manager/sales only
router.post("/", requireRole("admin", "manager", "sales"), async (req, res) => {
  const { name, phone, nid, address, postal, type, product, sendDate, deposit, total } = req.body || {};
  if (!name || !phone || !type || !product) return res.status(400).json({ error: "اطلاعات سفارش ناقص است" });

  const db = await getDB();
  const id = nextId(db, "orders");
  const order = {
    id, customerId: null, name, phone, nid: nid || "", address: address || "", postal: postal || "",
    type, product, sendDate: sendDate || "", deposit: deposit || "0", total: total || "0",
    stage: 0, registeredBy: req.user.name, trackingCode: genTracking(id),
  };
  db.orders.unshift(order);
  await saveDB(db);
  res.status(201).json(order);
});

// Advance / update an order's stage — admin/manager/sales/accounting
router.patch("/:id", requireRole("admin", "manager", "sales", "accounting"), async (req, res) => {
  const db = await getDB();
  const order = db.orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: "سفارش یافت نشد" });
  if ("stage" in req.body) order.stage = Math.max(0, Math.min(ORDER_STAGES.length - 1, Number(req.body.stage)));
  await saveDB(db);
  res.json(order);
});

// Delete an order — admin (سازنده) only
router.delete("/:id", requireRole("admin"), async (req, res) => {
  const db = await getDB();
  const before = db.orders.length;
  db.orders = db.orders.filter((o) => o.id !== Number(req.params.id));
  if (db.orders.length === before) return res.status(404).json({ error: "سفارش یافت نشد" });
  await saveDB(db);
  res.json({ ok: true });
});

module.exports = router;
