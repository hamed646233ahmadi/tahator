import { useState } from "react";
import useCategory from "hooks/useCategory.js";
import styles from "./AddPost.module.css";
import { getCookie } from "utils/cookie.js";
import axios from "axios";
import { toast } from "react-hot-toast";

const ASSET_TYPES = [
  { value: "vehicle", label: "خودرو" },
  { value: "property", label: "ملک و زمین" },
  { value: "gold", label: "طلا و سکه" },
  { value: "cash", label: "وجه نقد" },
  { value: "other", label: "سایر دارایی‌ها" },
];

function AddPost() {
  const { getCategories } = useCategory();
  const [busy, setBusy] = useState(false);
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [form, setForm] = useState({
    title_post: "",
    description: "",
    category: "",
    amount: "0",
    listingType: "barter",
    offerAssetType: "vehicle",
    offerAssetDetails: "",
    wantedAssetType: "property",
    wantedAssetDetails: "",
    cashDifference: "0",
    city: "",
    province: "",
    images: [],
  });

  const changeHandler = (event) => {
    const { name, value, files } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: name === "images" ? Array.from(files || []) : value,
    }));
  };

  const selectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("مرورگر شما از تعیین موقعیت پشتیبانی نمی‌کند.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: String(coords.latitude), lng: String(coords.longitude) });
        toast.success("موقعیت ثبت شد. شهر را هم بررسی کنید.");
      },
      () => toast.error("دسترسی موقعیت فعال نشد؛ مجوز مرورگر را بررسی کنید."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const addHandler = async (event) => {
    event.preventDefault();
    if (!form.category) {
      toast.error("لطفاً دسته‌بندی آگهی را انتخاب کنید.");
      return;
    }
    if (form.listingType === "barter" && !form.wantedAssetDetails.trim()) {
      toast.error("دارایی موردنظر برای تهاتر را وارد کنید.");
      return;
    }
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("title_post", form.title_post);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("amount", form.amount || "0");
      formData.append("listingType", form.listingType);
      formData.append("offerAssetType", form.offerAssetType);
      formData.append("offerAssetDetails", form.offerAssetDetails);
      formData.append("wantedAssetType", form.listingType === "barter" ? form.wantedAssetType : "other");
      formData.append("wantedAssetDetails", form.wantedAssetDetails);
      formData.append("cashDifference", form.cashDifference || "0");
      formData.append("city", form.city);
      formData.append("province", form.province);
      formData.append("lat", location.lat);
      formData.append("lng", location.lng);
      form.images.forEach((file) => formData.append("images", file));
      const token = getCookie("accessToken");
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}post/create`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message || "آگهی ثبت شد.");
      setForm({
        title_post: "", description: "", category: "", amount: "0", listingType: "barter",
        offerAssetType: "vehicle", offerAssetDetails: "", wantedAssetType: "property",
        wantedAssetDetails: "", cashDifference: "0", city: "", province: "", images: [],
      });
      setLocation({ lat: "", lng: "" });
      event.target.reset();
    } catch (error) {
      toast.error(error?.response?.data?.message || "ثبت آگهی انجام نشد؛ ورود و اتصال سرور را بررسی کنید.");
      console.error("Create listing failed", error);
    } finally {
      setBusy(false);
    }
  };

  const categories = getCategories?.data?.categories || getCategories?.data || [];

  return (
    <form onSubmit={addHandler} className={styles.form}>
      <h3>ثبت آگهی در تهاتر</h3>
      <p className={styles.helper}>ابتدا آگهی‌ها را بررسی کنید؛ برای ثبت، دارایی خود و چیزی را که می‌خواهید دریافت کنید مشخص کنید.</p>

      <label htmlFor="listingType">نوع آگهی</label>
      <select name="listingType" id="listingType" value={form.listingType} onChange={changeHandler}>
        <option value="barter">تهاتر دارایی</option>
        <option value="employment">استخدام و فرصت شغلی</option>
      </select>

      <label htmlFor="title_post">عنوان آگهی</label>
      <input required maxLength={120} name="title_post" id="title_post" value={form.title_post} onChange={changeHandler} placeholder="مثلاً معاوضه خودرو با ملک یا طلا" />

      {form.listingType === "barter" ? (
        <>
          <label htmlFor="offerAssetType">دارایی‌ای که ارائه می‌کنید</label>
          <select name="offerAssetType" id="offerAssetType" value={form.offerAssetType} onChange={changeHandler}>
            {ASSET_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <label htmlFor="offerAssetDetails">مشخصات دارایی شما</label>
          <textarea required name="offerAssetDetails" id="offerAssetDetails" value={form.offerAssetDetails} onChange={changeHandler} placeholder="مدل و سال خودرو، مشخصات ملک، وزن و عیار طلا و..." />

          <label htmlFor="wantedAssetType">دارایی موردنظر شما</label>
          <select name="wantedAssetType" id="wantedAssetType" value={form.wantedAssetType} onChange={changeHandler}>
            {ASSET_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <label htmlFor="wantedAssetDetails">چه چیزی دریافت می‌کنید؟</label>
          <textarea required name="wantedAssetDetails" id="wantedAssetDetails" value={form.wantedAssetDetails} onChange={changeHandler} placeholder="مثلاً آپارتمان در تهران، خودروی مشخص، طلا به‌علاوه وجه نقد..." />
          <label htmlFor="cashDifference">مبلغ نقدی مابه‌التفاوت (تومان، اختیاری)</label>
          <input type="number" min="0" name="cashDifference" id="cashDifference" value={form.cashDifference} onChange={changeHandler} />
        </>
      ) : (
        <>
          <label htmlFor="offerAssetDetails">عنوان شغل و مهارت‌های موردنیاز</label>
          <textarea required name="offerAssetDetails" id="offerAssetDetails" value={form.offerAssetDetails} onChange={changeHandler} placeholder="شرح شغل، مهارت‌ها و شرایط همکاری" />
          <label htmlFor="wantedAssetDetails">شرایط و راه ارتباطی پیشنهادی</label>
          <textarea name="wantedAssetDetails" id="wantedAssetDetails" value={form.wantedAssetDetails} onChange={changeHandler} placeholder="نوع همکاری، ساعات، حقوق یا توضیحات تکمیلی" />
        </>
      )}

      <label htmlFor="description">توضیحات تکمیلی</label>
      <textarea name="description" id="description" value={form.description} onChange={changeHandler} placeholder="جزئیات بیشتر، شرایط تهاتر و موارد قابل مذاکره" />

      <label htmlFor="amount">ارزش تقریبی دارایی (تومان، اختیاری)</label>
      <input type="number" min="0" name="amount" id="amount" value={form.amount} onChange={changeHandler} />

      <label htmlFor="category">دسته‌بندی</label>
      <select required name="category" id="category" value={form.category} onChange={changeHandler}>
        <option value="">انتخاب دسته‌بندی</option>
        {Array.isArray(categories) && categories.map((item) => (
          <option key={item._id} value={item._id}>{item.name}</option>
        ))}
      </select>

      <label htmlFor="province">استان</label>
      <input name="province" id="province" value={form.province} onChange={changeHandler} placeholder="مثلاً تهران" />
      <label htmlFor="city">شهر</label>
      <input name="city" id="city" value={form.city} onChange={changeHandler} placeholder="مثلاً تهران" />
      <button type="button" onClick={selectLocation}>ثبت موقعیت فعلی دستگاه</button>
      <p className={styles.helper}>{location.lat ? `موقعیت ثبت شد: ${location.lat}, ${location.lng}` : "برای ثبت موقعیت، اجازه دسترسی مکان را در مرورگر بدهید. انتخاب دستی روی نقشه در مرحله اتصال سرویس نقشه اضافه می‌شود."}</p>

      <label htmlFor="images">تصاویر (امکان انتخاب چند عکس)</label>
      <input type="file" accept="image/*" multiple name="images" id="images" onChange={changeHandler} />
      <button type="submit" disabled={busy}>{busy ? "در حال ثبت..." : "ثبت آگهی"}</button>
    </form>
  );
}

export default AddPost;
