import { Link } from "react-router-dom";
import { sp } from "utils/numbers.js";
import styles from "./Main.module.css";

const TYPE_LABELS = {
  barter: "تهاتر",
  employment: "استخدام",
};

const ASSET_LABELS = {
  vehicle: "خودرو",
  property: "ملک",
  gold: "طلا",
  cash: "وجه نقد",
  other: "سایر",
};

function Main({ getAllPost, selectedCategory }) {
  const posts = getAllPost?.data?.posts || [];
  const filteredPosts = selectedCategory
    ? posts.filter((post) => String(post.category?._id || post.category) === String(selectedCategory))
    : posts;

  if (!filteredPosts.length) {
    return <div className={styles.empty}>هنوز آگهی‌ای برای نمایش وجود ندارد.</div>;
  }

  return (
    <div className={styles.container}>
      {filteredPosts.map((post) => {
        const title = post.title || post.options?.title || "آگهی تهاتر";
        const isJob = post.listingType === "employment";
        const image = post.images?.[0];
        const location = [post.city || post.options?.city, post.province].filter(Boolean).join("، ");
        return (
          <Link to={`/details/${post._id}`} key={post._id} className={styles.card}>
            <div className={styles.info}>
              <span className={styles.badge}>{TYPE_LABELS[post.listingType] || "تهاتر"}</span>
              <p className={styles.title}>{title}</p>
              {isJob ? (
                <p className={styles.detail}>{post.offerAssetDetails || post.content || "جزئیات فرصت شغلی در صفحه آگهی"}</p>
              ) : (
                <>
                  <p className={styles.detail}>
                    ارائه: {ASSET_LABELS[post.offerAssetType] || "دارایی"} — {post.offerAssetDetails || post.content || "جزئیات در صفحه آگهی"}
                  </p>
                  <p className={styles.detail}>
                    درخواست: {ASSET_LABELS[post.wantedAssetType] || "دارایی"} — {post.wantedAssetDetails || "قابل مذاکره"}
                  </p>
                  {Number(post.cashDifference) > 0 && (
                    <p className={styles.amount}>مابه‌التفاوت: {sp(post.cashDifference)} تومان</p>
                  )}
                </>
              )}
              <div className={styles.meta}>
                <span>{location || "موقعیت ثبت نشده"}</span>
                {Number(post.amount) > 0 && <span>ارزش تقریبی: {sp(post.amount)} تومان</span>}
              </div>
            </div>
            {image ? (
              <img src={`${import.meta.env.VITE_BASE_URL}${image}`} alt={title} loading="lazy" />
            ) : (
              <div className={styles.imagePlaceholder}>{isJob ? "استخدام" : "تهاتر"}</div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default Main;
