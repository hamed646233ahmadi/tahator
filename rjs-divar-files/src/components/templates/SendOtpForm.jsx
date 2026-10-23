import React from 'react';
import { sendOtp } from "services/auth.js";
import styles from "./SendOtpForm.module.css";
import { p2e } from "../../utils/numbers.js";

function SendOtpForm({ mobile, setMobile, setStep }) {
    const submitHandler = async (e) => {
        e.preventDefault();
        if (p2e(mobile).replace(/\\D/g, '').length !== 11) return;
        const { response, error } = await sendOtp(mobile);
        if (response) setStep(2);
        if (error) console.error("OTP request failed", error);
    };

    return (
        <form onSubmit={submitHandler} className={styles.form}>
            <p>ورود به تهاتر</p>
            <span>برای ثبت آگهی، پیشنهاد معاوضه و مدیریت حساب، شماره موبایل خود را وارد کنید. کد تأیید برای شما پیامک می‌شود.</span>
            <label htmlFor="input">شماره موبایل</label>
            <input type="tel" inputMode="numeric" autoComplete="tel" id="input" placeholder="مثلاً 09123456789" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            <button type="submit">دریافت کد تأیید</button>
        </form>
    );
}
export default SendOtpForm;