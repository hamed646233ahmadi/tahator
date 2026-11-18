require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline");
const Staff = require("../src/modules/staff/staff.model");
const { seedRoles } = require("../src/modules/staff/staff.service");
const ask = (q) => new Promise(resolve => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); rl.question(q, answer => { rl.close(); resolve(answer.trim()); }); });
(async () => {
  try {
    if (!process.env.MONGODB_URL || !process.env.JWT_SECRET_KEY) throw new Error("MONGODB_URL و JWT_SECRET_KEY باید تنظیم شده باشند");
    await mongoose.connect(process.env.MONGODB_URL);
    await seedRoles();
    if (await Staff.exists({ roleKey: "super_admin" })) throw new Error("حساب مدیر ارشد از قبل وجود دارد؛ ساخت مجدد متوقف شد");
    const fullName = await ask("نام مدیر ارشد: ");
    const mobile = await ask("شماره موبایل با کد کشور: ");
    if (!fullName || !/^\+?[0-9]{8,15}$/.test(mobile)) throw new Error("نام یا شماره موبایل معتبر نیست");
    await Staff.create({ fullName, mobile, roleKey: "super_admin" });
    process.stdout.write("حساب مدیر ارشد ایجاد شد. ورود فقط پس از فعال‌سازی درگاه پیامک ممکن است.\n");
  } catch (error) { process.stderr.write((error.message || String(error)) + "\n"); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();