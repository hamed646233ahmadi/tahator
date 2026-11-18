const createHttpError = require("http-errors");
// Provider adapter intentionally stays disabled until the selected SMS vendor is configured.
async function sendStaffOtp({ mobile, code }) {
  if (process.env.SMS_ENABLED !== "true") {
    throw new createHttpError.ServiceUnavailable("سرویس پیامک هنوز فعال نشده است");
  }
  if (!process.env.SMS_PROVIDER || !process.env.SMS_API_URL || !process.env.SMS_API_TOKEN) {
    throw new createHttpError.ServiceUnavailable("تنظیمات سرویس پیامک کامل نیست");
  }
  // Vendor-specific request mapping must be implemented after the provider is identified.
  throw new createHttpError.ServiceUnavailable("درگاه انتخاب‌شده هنوز به آداپتور پیامک متصل نشده است");
}
module.exports = { sendStaffOtp };