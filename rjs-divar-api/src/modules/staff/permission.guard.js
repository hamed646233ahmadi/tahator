const createHttpError = require("http-errors");
module.exports = function requirePermission(permission) {
  return (req, res, next) => {
    const permissions = req.staffPermissions || [];
    if (permissions.includes("*") || permissions.includes(permission)) return next();
    next(new createHttpError.Forbidden("اجازه انجام این عملیات را ندارید"));
  };
};