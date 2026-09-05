require("dotenv").config();
const express = require("express");
require("express-async-errors"); // must load after express, before routes
const cors = require("cors");
const path = require("path");
const os = require("os");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 4000;

// Uploaded files are written to /tmp (the only writable path on Vercel).
// NOTE: /tmp is ephemeral on Vercel — files won't survive a cold start.
const uploadsRoot = path.join(os.tmpdir(), "uploads");
fs.mkdirSync(path.join(uploadsRoot, "chat"), { recursive: true });

app.use("/uploads", express.static(uploadsRoot));

// Default allowed origins + anything set via CORS_ORIGINS env var
// (comma-separated list of full frontend URLs), e.g.:
// CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()) : []),
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/crm", require("./routes/crm"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/reports", require("./routes/reports"));

app.get("/api/health", (req, res) => res.json({ ok: true, name: "company-management-backend" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "خطای داخلی سرور" });
});

// Only listen on a port when run directly (local dev / traditional hosting).
// On Vercel, this file is imported by api/index.js as a serverless handler instead.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Backend در حال اجرا روی http://localhost:${PORT}`);
  });
}

module.exports = app;
