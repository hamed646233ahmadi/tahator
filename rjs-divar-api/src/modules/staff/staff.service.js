const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const Staff = require("./staff.model");
const StaffRole = require("./role.model");
const AuditLog = require("./audit-log.model");
const { ROLE_DEFINITIONS, ALL_PERMISSIONS } = require("./staff.constants");
const { sendStaffOtp } = require("./sms.provider");
const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");
async function seedRoles() {
  for (const role of ROLE_DEFINITIONS) {
    await StaffRole.updateOne({ key: role.key }, { $setOnInsert: { ...role, isSystem: true, isActive: true } }, { upsert: true });
  }
}
async function audit(req, action, targetType, targetId, details = {}) {
  await AuditLog.create({
    actor: req.staff?._id, actorName: req.staff?.fullName, action, targetType, targetId,
    details, ip: req.ip, userAgent: req.get("user-agent")
  });
}
function canManageRole(actor, targetRole) {
  if (actor.roleKey === "super_admin") return true;
  if (targetRole === "super_admin" || targetRole === "internal_manager" || targetRole === "support_manager") return false;
  if (actor.roleKey === "internal_manager") return ["user_support", "listing_support", "technical_support", "content_manager", "finance", "marketing_manager", "auditor"].includes(targetRole);
  if (actor.roleKey === "support_manager") return ["user_support", "listing_support", "technical_support"].includes(targetRole);
  return false;
}
async function requestOtp(mobile) {
  const staff = await Staff.findOne({ mobile });
  if (!staff || !staff.isActive) throw new createHttpError.Unauthorized("حساب کارمندی فعال یافت نشد");
  const code = String(crypto.randomInt(100000, 1000000));
  const pepper = process.env.STAFF_OTP_SECRET || process.env.JWT_SECRET_KEY;
  if (!pepper) throw new createHttpError.InternalServerError("تنظیمات امنیتی سرور ناقص است");
  await sendStaffOtp({ mobile, code });
  staff.otpHash = digest(mobile + ":" + code + ":" + pepper);
  staff.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
  staff.failedOtpAttempts = 0;
  await staff.save();
}
async function verifyOtp(mobile, code) {
  const staff = await Staff.findOne({ mobile }).select("+otpHash +otpExpiresAt +failedOtpAttempts");
  if (!staff || !staff.isActive) throw new createHttpError.Unauthorized("حساب کارمندی فعال یافت نشد");
  if (!staff.otpHash || !staff.otpExpiresAt || staff.otpExpiresAt < new Date()) throw new createHttpError.Unauthorized("کد ورود منقضی شده است");
  if (staff.failedOtpAttempts >= 5) throw new createHttpError.TooManyRequests("تعداد تلاش ناموفق بیش از حد مجاز است");
  const pepper = process.env.STAFF_OTP_SECRET || process.env.JWT_SECRET_KEY;
  const expected = digest(mobile + ":" + String(code) + ":" + pepper);
  const a = Buffer.from(expected, "hex"), b = Buffer.from(staff.otpHash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    staff.failedOtpAttempts += 1; await staff.save();
    throw new createHttpError.Unauthorized("کد ورود اشتباه است");
  }
  staff.otpHash = undefined; staff.otpExpiresAt = undefined; staff.failedOtpAttempts = 0;
  staff.lastLoginAt = new Date();
  const token = jwt.sign({ id: String(staff._id), type: "staff", tokenVersion: staff.tokenVersion }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.STAFF_ACCESS_TOKEN_TTL || "8h" });
  await staff.save();
  return { accessToken: token, staff: { id: staff._id, fullName: staff.fullName, mobile: staff.mobile, roleKey: staff.roleKey } };
}
async function listStaff() {
  return Staff.find().select("-otpHash -otpExpiresAt -failedOtpAttempts").sort({ createdAt: -1 }).lean();
}
async function createStaff(req, data) {
  const { fullName, mobile, roleKey } = data;
  if (!fullName || !/^\+?[0-9]{8,15}$/.test(String(mobile || "")) || !roleKey) throw new createHttpError.BadRequest("نام، شماره موبایل معتبر و نقش الزامی است");
  if (!canManageRole(req.staff, roleKey)) throw new createHttpError.Forbidden("امکان ایجاد کارمند با این نقش را ندارید");
  const role = await StaffRole.findOne({ key: roleKey, isActive: true });
  if (!role) throw new createHttpError.BadRequest("نقش انتخاب‌شده معتبر نیست");
  if (await Staff.exists({ mobile })) throw new createHttpError.Conflict("این شماره موبایل قبلاً ثبت شده است");
  const staff = await Staff.create({ fullName: fullName.trim(), mobile, roleKey, createdBy: req.staff._id });
  await audit(req, "staff.created", "staff", String(staff._id), { roleKey });
  return staff.toObject();
}
async function updateStaff(req, id, data) {
  const staff = await Staff.findById(id);
  if (!staff) throw new createHttpError.NotFound("کارمند یافت نشد");
  if (!canManageRole(req.staff, staff.roleKey)) throw new createHttpError.Forbidden("اجازه ویرایش این کارمند را ندارید");
  if (data.roleKey && data.roleKey !== staff.roleKey && !canManageRole(req.staff, data.roleKey)) throw new createHttpError.Forbidden("اجازه انتساب این نقش را ندارید");
  if (data.fullName) staff.fullName = String(data.fullName).trim();
  if (data.roleKey) {
    const exists = await StaffRole.exists({ key: data.roleKey, isActive: true });
    if (!exists) throw new createHttpError.BadRequest("نقش معتبر نیست");
    staff.roleKey = data.roleKey;
  }
  if (Array.isArray(data.permissionOverrides)) {
    if (req.staff.roleKey !== "super_admin") throw new createHttpError.Forbidden("تغییر مستقیم مجوزها فقط برای مدیر ارشد مجاز است");
    if (data.permissionOverrides.includes("*") || data.permissionOverrides.some(p => !ALL_PERMISSIONS.includes(p))) throw new createHttpError.BadRequest("مجوز ناشناخته یا غیرمجاز است");
    staff.permissionOverrides = data.permissionOverrides;
  }
  staff.updatedBy = req.staff._id;
  await staff.save();
  await audit(req, "staff.updated", "staff", id, { changedFields: Object.keys(data).filter(k => ["fullName", "roleKey", "permissionOverrides"].includes(k)) });
  return staff.toObject();
}
async function setStaffActive(req, id, isActive) {
  const staff = await Staff.findById(id);
  if (!staff) throw new createHttpError.NotFound("کارمند یافت نشد");
  if (staff.roleKey === "super_admin" || !canManageRole(req.staff, staff.roleKey)) throw new createHttpError.Forbidden("امکان تغییر وضعیت این حساب وجود ندارد");
  staff.isActive = Boolean(isActive);
  staff.tokenVersion += 1;
  staff.updatedBy = req.staff._id;
  await staff.save();
  await audit(req, staff.isActive ? "staff.activated" : "staff.disabled", "staff", id);
  return { id, isActive: staff.isActive };
}
async function listRoles() { return StaffRole.find({ isActive: true }).sort({ key: 1 }).lean(); }
async function updateRole(req, key, permissions) {
  if (req.staff.roleKey !== "super_admin") throw new createHttpError.Forbidden("فقط مدیر ارشد می‌تواند مجوز نقش‌ها را تغییر دهد");
  if (!Array.isArray(permissions) || permissions.some(p => p !== "*" && !ALL_PERMISSIONS.includes(p))) throw new createHttpError.BadRequest("فهرست مجوزها معتبر نیست");
  if (key === "super_admin" && !permissions.includes("*")) throw new createHttpError.BadRequest("مدیر ارشد باید دسترسی کامل داشته باشد");
  const role = await StaffRole.findOneAndUpdate({ key }, { $set: { permissions } }, { new: true, runValidators: true });
  if (!role) throw new createHttpError.NotFound("نقش یافت نشد");
  await audit(req, "role.permissions_updated", "role", key, { permissions });
  return role;
}
async function listAuditLogs(limit = 100) { return AuditLog.find().sort({ createdAt: -1 }).limit(Math.min(Math.max(Number(limit) || 100, 1), 200)).lean(); }
async function logout(req) {
  req.staff.tokenVersion += 1;
  await req.staff.save();
  await audit(req, "staff.logout", "staff", String(req.staff._id));
}
module.exports = { seedRoles, requestOtp, verifyOtp, listStaff, createStaff, updateStaff, setStaffActive, listRoles, updateRole, listAuditLogs, logout, audit };