const { Schema, model } = require("mongoose");
const StaffSchema = new Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  mobile: { type: String, required: true, unique: true, index: true },
  roleKey: { type: String, required: true, index: true },
  permissionOverrides: { type: [String], default: undefined },
  isActive: { type: Boolean, default: true, index: true },
  otpHash: { type: String, select: false },
  otpExpiresAt: { type: Date, select: false },
  failedOtpAttempts: { type: Number, default: 0, select: false },
  tokenVersion: { type: Number, default: 0 },
  lastLoginAt: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: "Staff" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "Staff" }
}, { timestamps: true });
module.exports = model("Staff", StaffSchema);