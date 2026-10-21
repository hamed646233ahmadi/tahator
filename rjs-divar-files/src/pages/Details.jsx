import { useParams, Link } from "react-router-dom";
import useUser from "hooks/useUser";
import { sp } from "utils/numbers.js";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./Details.module.css";
import Loader from "../components/modules/Loader";

const ASSET_LABELS = { vehicle: "خودرو", property: "ملک", gold: "طلا", cash: "وجه نقد", other: "سایر دارایی‌ها" };

function Details() {
  const { id } = useParams();
  const { getAllPost, isGetAllPost } = useUser();
  if (isGetAllPost) return <Loader />;

  const post = getAllPost?.data?.posts?.find((item) => item._id === id);
  if (!post) return <div className={styles.notFound}>آگهی موردنظر پیدا نشد.</div>;

  const title = post.title || post.options?.title || "آگهی تهاتر";
  const isJob = post.listingType === "employment";
  const location = [post.city || post.options?.city, post.province].filter(Boolean).join("، ");

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backButton}>بازگشت <FaArrowLeft /></Link>
      {post.images?.length > 0 && (
        <div className={styles.imageContainer}>
          <img src={`${import.meta.env.VITE_BASE_URL}${post.images[0]}`} alt={title} className={styles.image} />
        </div>
      )}
      <div className={styles.details}>
        <span className={styles.badge}>{isJob ? "استخدام و فرصت شغلی" : "آگهی تهاتر"}</span>
        <h1 className={styles.title}>{title}</h1>
        {location && <p className={styles.city}>{location}</p>}
        {Number(post.amount) > 0 && <p className={styles.price}>ارزش تقریبی دارایی: {sp(post.amount)} تومان</p>}
        {!isJob && (
          <>
            <h3>دارایی پیشنهادی</h3>
            <p className={styles.description}>{ASSET_LABELS[post.offerAssetType] || "دارایی"}: {post.offerAssetDetails || post.content || "جزئیات ثبت نشده است"}</p>
            <h3>دارایی موردنیاز</h3>
            <p className={styles.description}>{ASSET_LABELS[post.wantedAssetType] || "دارایی"}: {post.wantedAssetDetails || "قابل مذاکره"}</p>
            {Number(post.cashDifference) > 0 && <p className={styles.price}>مابه‌التفاوت: {sp(post.cashDifference)} تومان</p>}
          </>
        )}
        {isJob && <><h3>شرح فرصت</h3><p className={styles.description}>{post.offerAssetDetails || post.content || "توضیحات تکمیلی ثبت نشده است"}</p></>}
        {post.content && <><h3>توضیحات تکمیلی</h3><p className={styles.description}>{post.content}</p></>}
        <p className={styles.helper}>برای پیشنهاد تهاتر یا بررسی شرایط، از راه ارتباطی درج‌شده در آگهی با ثبت‌کننده تماس بگیرید.</p>
      </div>
    </div>
  );
}
export default Details;
