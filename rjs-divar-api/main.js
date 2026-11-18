const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const SwaggerConfig = require("./src/config/swagger.config");
const mainRouter = require("./src/app.routes");
const NotFoundHandler = require("./src/common/exception/not-found.handler");
const AllExceptionHandler = require("./src/common/exception/all-exception.handler");
dotenv.config();
async function main() {
  const app = express();
  const port = Number(process.env.PORT || 3000);
  if (!process.env.MONGODB_URL || !process.env.JWT_SECRET_KEY) throw new Error("MONGODB_URL and JWT_SECRET_KEY are required");
  await mongoose.connect(process.env.MONGODB_URL);
  await require("./src/modules/staff/staff.service").seedRoles();
  const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean);
  app.use(cors({ origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  }, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(express.static("public"));
  app.use(mainRouter);
  SwaggerConfig(app);
  NotFoundHandler(app);
  AllExceptionHandler(app);
  app.listen(port, "0.0.0.0", () => console.log(`API listening on port ${port}`));
}
main().catch(error => { console.error("API startup failed:", error.message); process.exit(1); });