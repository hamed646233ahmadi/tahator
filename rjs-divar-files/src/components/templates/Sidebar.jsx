import styles from "./Sidebar.module.css";
import { FaThLarge } from "react-icons/fa";

function Sidebar({ getCategories, onCategorySelect, selectedCategory }) {
    const categories = Array.isArray(getCategories?.data) ? getCategories.data : [];
    const handleClick = (id) => onCategorySelect?.(id);

    return (
        <aside className={styles.sidebar}>
            <h4>دسته‌بندی آگهی‌ها</h4>
            <ul>
                <li onClick={() => handleClick(null)} className={selectedCategory === null ? styles.selected : ''} role="button" tabIndex={0}>
                    <FaThLarge className={styles.icon} />
                    <p>همه آگهی‌ها</p>
                </li>
                {categories.map((category) => (
                    <li key={category._id} onClick={() => handleClick(category._id)} className={selectedCategory === category._id ? styles.selected : ''} role="button" tabIndex={0}>
                        {category.icon && <img src={category.icon.startsWith('/') ? category.icon : `/${category.icon}.svg`} alt="" />}
                        <p>{category.name}</p>
                    </li>
                ))}
            </ul>
            {!categories.length && <p className={styles.emptyHint}>دسته‌بندی‌ها پس از اتصال سرور نمایش داده می‌شوند.</p>}
        </aside>
    );
}
export default Sidebar;