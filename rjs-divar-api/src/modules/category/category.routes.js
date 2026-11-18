const { Router } = require("express");
const categoryController = require("./category.controller");
const staffAuth = require("../staff/staff-auth.guard");
const requirePermission = require("../staff/permission.guard");
const router = Router();
router.post("/", staffAuth, requirePermission("categories.write"), categoryController.create);
router.get("/", categoryController.find);
router.delete("/:id", staffAuth, requirePermission("categories.write"), categoryController.remove);
module.exports = { CategoryRouter: router };