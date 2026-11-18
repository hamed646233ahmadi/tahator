const ROLE_DEFINITIONS = [
  { key: "super_admin", title: "مدیر ارشد", permissions: ["*"] },
  { key: "internal_manager", title: "مدیر داخلی", permissions: ["staff.read", "staff.create", "staff.update", "roles.read", "audit.read", "categories.read", "categories.write"] },
  { key: "support_manager", title: "مدیر پشتیبانی", permissions: ["staff.read", "staff.create", "staff.update", "roles.read", "audit.read", "support.users", "support.listings"] },
  { key: "user_support", title: "پشتیبانی کاربران", permissions: ["support.users"] },
  { key: "listing_support", title: "پشتیبانی آگهی‌ها", permissions: ["support.listings"] },
  { key: "technical_support", title: "پشتیبانی فنی", permissions: ["support.technical"] },
  { key: "content_manager", title: "مدیریت محتوا", permissions: ["content.read", "content.write"] },
  { key: "finance", title: "حسابداری و امور مالی", permissions: ["finance.read", "finance.write"] },
  { key: "marketing_manager", title: "مدیر بازاریابی", permissions: ["marketing.read", "marketing.write"] },
  { key: "auditor", title: "ناظر و حسابرس", permissions: ["audit.read", "reports.read"] }
];
const ALL_PERMISSIONS = [
  "staff.read", "staff.create", "staff.update", "staff.disable", "roles.read", "roles.write",
  "audit.read", "categories.read", "categories.write", "support.users", "support.listings",
  "support.technical", "content.read", "content.write", "finance.read", "finance.write",
  "marketing.read", "marketing.write", "reports.read"
];
module.exports = { ROLE_DEFINITIONS, ALL_PERMISSIONS };