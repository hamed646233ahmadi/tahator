import React from 'react';
import styles from "./Footer.module.css";

function Footer() {
    return (
        <footer className={styles.footer}>
            <strong>تهاتر</strong>
            <p>پلتفرم معاوضه خودرو، ملک، طلا و دارایی‌ها</p>
            <small>قبل از هر معامله، اصالت دارایی و شرایط توافق را بررسی کنید.</small>
        </footer>
    );
}
export default Footer;