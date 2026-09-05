const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

const ORDER_TYPES = [
  "کمپوست",
  "خاک پوششی",
  "محصولات صنعتی",
  "بسته‌بندی"
];

const ORDER_STAGES = [
  "ثبت سفارش",
  "در حال آماده‌سازی",
  "بسته‌بندی و کنترل کیفیت",
  "ارسال شده",
  "تحویل داده‌شده"
];

function genTracking(id) {
  return `TRK-${1400 + Number(id)}-${((Number(id) * 733) % 9000 + 1000)}`;
}

// ---- Mongo connection (cached across serverless invocations) ----
let cachedConn = null;

async function connect() {
  if (cachedConn && mongoose.connection.readyState === 1) return cachedConn;
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI تنظیم نشده است. آن را در فایل .env (برای اجرای محلی) یا در تنظیمات Environment Variables پروژه در Vercel اضافه کنید."
    );
  }
  cachedConn = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });
  return cachedConn;
}

// The whole app state is stored as ONE document in the "appstate" collection.
// This mirrors the old file-based db.json structure 1:1, so route files stay unchanged.
const AppStateSchema = new mongoose.Schema(
  { _id: String },
  { strict: false, collection: "appstate" }
);
const AppState =
  mongoose.models.AppState || mongoose.model("AppState", AppStateSchema);

function seed() {
  const pass = bcrypt.hashSync("123456", 8);

  const users = [
    {
      id: 1,
      username: "admin",
      passwordHash: pass,
      role: "admin",
      name: "مدیر",
    }
  ];

  return {
    _id: "singleton",
    nextId: {
      users: 101,
      tasks: 6,
      orders: 6,
      crmCalls: 5,
      chat: 5,
      notes: 3,
      reports: 4
    },
    users,
    tasks: [],
    orders: [],
    crmCalls: [],
    attendance: [],
    chatMessages: [],
    notes: [],
    reports: [],
  };
}

async function getDB() {
  await connect();
  let doc = await AppState.findById("singleton").lean();
  if (!doc) {
    const seeded = seed();
    await AppState.create(seeded);
    doc = seeded;
  }
  return doc;
}

async function saveDB(db) {
  await connect();
  db._id = "singleton";
  await AppState.replaceOne({ _id: "singleton" }, db, { upsert: true });
}

function nextId(db, key) {
  const id = db.nextId[key];
  db.nextId[key] = id + 1;
  return id;
}

module.exports = {
  getDB,
  saveDB,
  nextId,
  genTracking,
  ORDER_TYPES,
  ORDER_STAGES
};
