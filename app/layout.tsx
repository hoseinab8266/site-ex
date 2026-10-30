import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";

// فونت به‌صورت محلی بارگذاری می‌شود (بدون درخواست به سرویس‌های خارجی)
const vazir = localFont({
  src: "./fonts/Vazirmatn.woff2",
  variable: "--font-vazir",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "پلیرز | مواد پلیمری و رزین‌های صنعتی",
    template: "%s | پلیرز",
  },
  description:
    "پلیرز، فروشگاه آنلاین شرکت دانش‌بنیان آتیه رزین شریف. خرید مواد پلیمری و رزین‌های صنعتی با مشخصات فنی روشن و مشاوره تخصصی.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className="font-sans antialiased">
        <CartProvider>
        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="h-[104px] bg-white shadow-[0_1px_0_var(--color-line),0_6px_18px_-12px_rgba(6,48,58,.35)]"
            />
          }
        >
          <Header />
        </Suspense>
        <main>{children}</main>
        <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
