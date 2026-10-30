import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // تصاویر آپلودشده در public/uploads ذخیره می‌شوند و با مسیر نسبی سرو می‌شوند.
  poweredByHeader: false,
  // بستهٔ qrcode (اختیاری) سمت سرور و خارج از باندل اجرا می‌شود.
  serverExternalPackages: ["qrcode"],
};

export default nextConfig;
