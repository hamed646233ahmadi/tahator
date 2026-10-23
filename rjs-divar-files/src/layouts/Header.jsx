import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { getCookie, removeCookie } from "utils/cookie.js";
import useUser from "hooks/useUser.js";
import { FaSun, FaMoon, FaUser } from 'react-icons/fa';
import styles from "./Header.module.css";

function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { profile } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInStatus = !!getCookie('accessToken');
        setIsLoggedIn(loggedInStatus);
        localStorage.setItem('isLoggedIn', String(loggedInStatus));
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedDarkMode);
        document.body.classList.toggle('dark-mode', savedDarkMode);
    }, []);

    const handleLogout = () => {
        removeCookie('accessToken');
        removeCookie('refreshToken');
        localStorage.setItem('isLoggedIn', 'false');
        setIsDropdownOpen(false);
        navigate('/');
        window.location.reload();
    };

    const handleLogin = () => {
        navigate('/auth');
        setIsDropdownOpen(false);
    };

    const toggleDarkMode = () => {
        const next = !isDarkMode;
        setIsDarkMode(next);
        document.body.classList.toggle('dark-mode', next);
        localStorage.setItem('darkMode', String(next));
    };

    return (
        <header className={styles.header}>
            <div className={styles.brandGroup}>
                <Link to="/" className={styles.brand} aria-label="صفحه اصلی تهاتر">
                    <span className={styles.brandMark}>ت</span>
                    <span className={styles.brandName}>تهاتر</span>
                </Link>
                <button type="button" className={styles.locationButton} onClick={() => window.dispatchEvent(new CustomEvent('tahater:choose-location'))}>
                    <span aria-hidden="true">📍</span>
                    <span>انتخاب موقعیت</span>
                </button>
            </div>
            <div className={styles.headerActions}>
                <button type="button" aria-label="تغییر حالت نمایش" onClick={toggleDarkMode} className={styles.darkModeToggle}>
                    <div className={styles.iconWrapper}>
                        <FaSun className={`${styles.icon} ${styles.sunIcon} ${isDarkMode ? styles.hidden : ''}`} />
                        <FaMoon className={`${styles.icon} ${styles.moonIcon} ${isDarkMode ? '' : styles.hidden}`} />
                    </div>
                </button>
                <div className={styles.dropdown}>
                    <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} aria-expanded={isDropdownOpen}>
                        <span><FaUser /><span>{isLoggedIn ? "حساب کاربری" : "ورود / ثبت‌نام"}</span></span>
                    </button>
                    {isDropdownOpen && (
                        <div className={styles.dropdownContent}>
                            <Link to="/">صفحه اصلی</Link>
                            {profile?.data?.role === "ADMIN" && <Link to="/admin">پنل مدیریت</Link>}
                            {isLoggedIn ? <button type="button" onClick={handleLogout}>خروج از حساب</button> : <button type="button" onClick={handleLogin}>ورود با شماره موبایل</button>}
                        </div>
                    )}
                </div>
                <Link to="/dashboard" className={styles.button}>ثبت آگهی تهاتر</Link>
            </div>
        </header>
    );
}

export default Header;