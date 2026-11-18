const { Schema, model } = require("mongoose");
const AuditLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: "Staff", index: true },
  actorName: String,
  action: { type: String, required: true, index: true },
  targetType: String,
  targetId: String,
  details: { type: Schema.Types.Mixed, default: {} },
  ip: String,
  userAgent: String
}, { timestamps: true });
AuditLogSchema.index({ createdAt: -1 });
module.exports = model("StaffAuditLog", AuditLogSchema);