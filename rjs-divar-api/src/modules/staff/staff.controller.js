const service = require("./staff.service");
const wrap = (fn) => async (req, res, next) => { try { const data = await fn(req, res); res.json({ data }); } catch (error) { next(error); } };
module.exports = {
  sendOtp: wrap(async req => { await service.requestOtp(req.body.mobile); return { message: "درخواست ارسال کد ثبت شد" }; }),
  verifyOtp: wrap(async req => service.verifyOtp(req.body.mobile, req.body.code)),
  me: wrap(async req => ({ id: req.staff._id, fullName: req.staff.fullName, mobile: req.staff.mobile, roleKey: req.staff.roleKey, permissions: req.staffPermissions })),
  logout: wrap(async req => { await service.logout(req); return { message: "خروج انجام شد" }; }),
  listStaff: wrap(async () => service.listStaff()),
  createStaff: wrap(async req => service.createStaff(req, req.body)),
  updateStaff: wrap(async req => service.updateStaff(req, req.params.id, req.body)),
  setActive: wrap(async req => service.setStaffActive(req, req.params.id, req.body.isActive)),
  listRoles: wrap(async () => service.listRoles()),
  updateRole: wrap(async req => service.updateRole(req, req.params.key, req.body.permissions)),
  auditLogs: wrap(async req => service.listAuditLogs(req.query.limit))
};