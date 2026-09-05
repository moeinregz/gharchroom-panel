// Vercel entrypoint: exposes the Express app as a serverless function.
// Every request (thanks to vercel.json rewrites) is routed here, while
// req.url still contains the original path (e.g. /api/auth/login), so the
// existing app.use("/api/...", ...) routes in server.js keep working as-is.
module.exports = require("../server");
