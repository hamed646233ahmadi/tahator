const { Schema, model } = require("mongoose");
const RoleSchema = new Schema({
  key: { type: String, required: true, unique: true, immutable: true },
  title: { type: String, required: true, trim: true },
  permissions: { type: [String], default: [] },
  isSystem: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = model("StaffRole", RoleSchema);