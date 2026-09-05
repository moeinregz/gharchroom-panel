const express = require("express");
const { getDB, saveDB, nextId } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const isBoss = (role) => role === "admin" || role === "manager";

// List tasks: admin/manager see all, others see only their own
router.get("/", async (req, res) => {
  const db = await getDB();
  const tasks = isBoss(req.user.role) ? db.tasks : db.tasks.filter((t) => t.assignedTo === req.user.id);
  res.json(tasks);
});

// Assign a new task — admin & manager only
router.post("/", requireRole("admin", "manager"), async (req, res) => {
  const { title, desc, assignedTo, due, priority } = req.body || {};
  if (!title || !assignedTo) return res.status(400).json({ error: "عنوان و اختصاص‌گیرنده الزامی است" });

  const db = await getDB();
  const task = { id: nextId(db, "tasks"), title, desc: desc || "", assignedTo: Number(assignedTo), assignedBy: req.user.name, due: due || "", priority: priority || "متوسط", status: "todo" };
  db.tasks.push(task);
  await saveDB(db);
  res.status(201).json(task);
});

// Toggle a task's completion — the assignee, or admin/manager
router.patch("/:id/toggle", async (req, res) => {
  const db = await getDB();
  const task = db.tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "تسک یافت نشد" });
  if (task.assignedTo !== req.user.id && !isBoss(req.user.role)) {
    return res.status(403).json({ error: "شما اجازه تغییر این تسک را ندارید" });
  }
  task.status = task.status === "done" ? "todo" : "done";
  await saveDB(db);
  res.json(task);
});

module.exports = router;
