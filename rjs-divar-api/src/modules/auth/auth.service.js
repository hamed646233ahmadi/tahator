const autoBind = require("auto-bind");
const UserModel = require("../user/user.model");
const createHttpError = require("http-errors");
const { AuthMessage } = require("./auth.messages");
const { randomInt } = require("crypto");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const axios = require("axios");
class AuthService {
  #model;
  constructor() {
    autoBind(this);
    this.#model = UserModel;
  }
  async sendOTP(mobile) {
    const user = await this.#model.findOne({ mobile });
    const now = new Date().getTime();
    const otp = {
      code: randomInt(10000, 99999),
      expiresIn: now + 1000 * 60 * 2,
    };
    let savedUser;
    if (!user) {
      savedUser = await this.#model.create({ mobile, otp });
    } else {
    // if (user.otp && user.otp.expiresIn > now) {
    //   throw new createHttpError.BadRequest(AuthMessage.OtpCodeNotExpired);
    // }
      user.otp = otp;
      await user.save();
      savedUser = user;
    }
    await this.deliverOTP(mobile, String(otp.code));
    return savedUser;
  }
  async deliverOTP(mobile, code) {
    const endpoint = process.env.SMS_API_URL;
    const token = process.env.SMS_API_TOKEN;
    if (endpoint) {
      await axios.post(endpoint, {
        receptor: mobile,
        mobile,
        message: `کد ورود تهاتر: ${code}`,
        text: `کد ورود تهاتر: ${code}`,
        sender: process.env.SMS_SENDER || undefined,
        token: token || undefined,
      }, { timeout: 10000, headers: token ? { Authorization: `Bearer ${token}` } : {} });
      return;
    }
    if (process.env.NODE_ENV !== "production" && process.env.OTP_DEV_LOG === "true") {
      console.info(`[DEV OTP] ${mobile}: ${code}`);
      return;
    }
    throw new createHttpError.ServiceUnavailable("سرویس پیامک تنظیم نشده است. مقادیر SMS_API_URL و SMS_API_TOKEN را در فایل محیطی تنظیم کنید.");
  }
  async checkOTP(mobile, code) {
    const user = await this.checkExistByMobile(mobile);
    const now = new Date().getTime();
    if (!user?.otp?.expiresIn || user.otp.expiresIn < now)
      throw new createHttpError.Unauthorized(AuthMessage.OtpCodeExpired);
    if (String(user?.otp?.code) !== String(code))
      throw new createHttpError.Unauthorized(AuthMessage.OtpCodeIsIncorrect);
    if (!user.verifiedMobile) {
      user.verifiedMobile = true;
    }
    const accessToken = this.signToken({ mobile, id: user._id });
    const refreshToken = this.signToken({ mobile, id: user._id }, "1y");
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();
    return {
      accessToken,
      refreshToken,
    };
  }
  async checkExistByMobile(mobile) {
    const user = await this.#model.findOne({ mobile });
    if (!user) throw new createHttpError.NotFound(AuthMessage.NotFound);
    return user;
  }
  async checkRefreshToken(refreshToken) {
    if (!refreshToken)
      throw new createHttpError.Unauthorized(AuthorizationMessage.Login);
    const data = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    if (typeof data === "object" && "id" in data) {
      const user = await UserModel.findById(data.id).lean();
      if (!user)
        throw new createHttpError.Unauthorized(
          AuthorizationMessage.NotFoundAccount
        );
      const accessToken = this.signToken({ mobile: user.mobile, id: user._id });
      const refreshToken = this.signToken({
        mobile: user.mobile,
        id: user._id,
      });
      await UserModel.updateOne(
        { _id: user._id },
        {
          $set: {
            accessToken,
            refreshToken,
          },
        }
      );
      return {
        accessToken,
        refreshToken,
      };
    }
    throw new createHttpError.Unauthorized();
  }
  signToken(
    payload,
    expiresIn = new Date().getTime() + 1000 * 60 * 60 * 24 * 30 * 12
  ) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn });
  }
}
module.exports = new AuthService();
