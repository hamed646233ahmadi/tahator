const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const Staff = require("./staff.model");
const StaffRole = require("./role.model");
module.exports = async function staffAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) throw new createHttpError.Unauthorized("ورود کارکنان الزامی است");
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (payload.type !== "staff" || !payload.id) throw new createHttpError.Unauthorized("توکن کارکنان معتبر نیست");
    const staff = await Staff.findById(payload.id);
    if (!staff || !staff.isActive || staff.tokenVersion !== payload.tokenVersion) {
      throw new createHttpError.Unauthorized("نشست نامعتبر یا غیرفعال است");
    }
    const role = await StaffRole.findOne({ key: staff.roleKey, isActive: true }).lean();
    if (!role) throw new createHttpError.Forbidden("نقش کارمند فعال نیست");
    req.staff = staff;
    req.staffRole = role;
    req.staffPermissions = staff.permissionOverrides || role.permissions || [];
    next();
  } catch (error) { next(error); }
};