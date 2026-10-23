import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Sidebar from "../components/templates/Sidebar.jsx";
import Main from "../components/templates/Main.jsx";
import useUser from "hooks/useUser.js";
import useCategory from "hooks/useCategory.js";
import Loader from "components/modules/Loader.jsx";

const pageStyle = { display: "flex", alignItems: "flex-start", gap: "24px", width: "100%" };
const heroStyle = { background: "#ffd400", color: "#111", border: "2px solid #111", borderRadius: "18px", padding: "28px clamp(18px, 4vw, 48px)", margin: "4px 0 24px", boxShadow: "0 5px 0 #111" };
const chipStyle = { display: "inline-flex", padding: "7px 12px", border: "1px solid #111", borderRadius: "999px", fontWeight: 800, margin: "5px 5px 0 0", background: "#fff" };

function HomePage() {
    const { getCategories, isGetCategories } = useCategory();
    const { getAllPost, isGetAllPost } = useUser();
    const [selectedCategory, setSelectedCategory] = useState(null);

    return (
        <main style={{ width: "100%" }}>
            <section style={heroStyle}>
                <div style={{ fontSize: "13px", fontWeight: 900, letterSpacing: ".02em" }}>بازار معاوضه دارایی‌ها</div>
                <h1 style={{ fontSize: "clamp(28px, 4vw, 46px)", lineHeight: 1.35, margin: "8px 0", fontWeight: 950 }}>چیزی که داری، با چیزی که می‌خوای معاوضه کن.</h1>
                <p style={{ fontSize: "16px", maxWidth: "720px", lineHeight: 1.9, margin: "0 0 15px" }}>آگهی تهاتر خودرو، ملک، طلا و دارایی‌های دیگر؛ با امکان توافق روی مابه‌التفاوت.</p>
                <div>
                    <span style={chipStyle}>خودرو ↔ ملک</span>
                    <span style={chipStyle}>خودرو ↔ طلا</span>
                    <span style={chipStyle}>معاوضه با مابه‌التفاوت</span>
                    <span style={chipStyle}>فرصت‌های شغلی</span>
                </div>
                <div style={{ marginTop: "22px" }}>
                    <Link to="/dashboard" style={{ display: "inline-flex", background: "#111", color: "#ffd400", borderRadius: "9px", padding: "12px 20px", fontWeight: 900 }}>ثبت آگهی تهاتر ←</Link>
                </div>
            </section>
            <div style={pageStyle} className="tahater-listing-layout">
                {!isGetCategories && <Sidebar getCategories={getCategories} onCategorySelect={setSelectedCategory} selectedCategory={selectedCategory} />}
                {isGetAllPost ? <div style={{ flex: 1, minHeight: "220px", display: "grid", placeItems: "center" }}><Loader /></div> : <Main getAllPost={getAllPost} selectedCategory={selectedCategory} />}
            </div>
        </main>
    );
}

export default HomePage;