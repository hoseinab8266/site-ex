راهنمای بستهٔ «فایل‌های تغییر‌یافته» — پلیرز
==============================================

این زیپ فقط شامل فایل‌های اضافه‌شده و ویرایش‌شده است و ساختار پوشه‌ها را
حفظ می‌کند. آن را روی نسخهٔ قبلی پروژه باز کنید (overlay).

نصب:
  1) محتوای زیپ را روی ریشهٔ پروژه کپی/استخراج کنید.
  2) فایل‌های زیر را که حذف شده‌اند، دستی پاک کنید (زیپ نمی‌تواند حذف را
     منتقل کند) — همه بی‌استفاده یا منتقل‌شده‌اند:

     app/admin/articles/page.tsx      (منتقل شد به app/admin/(panel)/articles/)
     app/admin/layout.tsx             (منتقل شد به app/admin/(panel)/layout.tsx)
     app/admin/members/page.tsx       (منتقل شد به app/admin/(panel)/members/)
     app/admin/orders/page.tsx        (منتقل شد به app/admin/(panel)/orders/)
     app/admin/page.tsx               (منتقل شد به app/admin/(panel)/page.tsx)
     app/admin/products/new/page.tsx  (منتقل شد به app/admin/(panel)/products/new/)
     app/admin/products/page.tsx      (منتقل شد به app/admin/(panel)/products/)
     app/login/actions.ts             (server action بی‌استفاده)
     components/LoginForm.tsx         (بی‌استفاده)
     components/OrderStatusSelect.tsx (بی‌استفاده)
     components/PanelNav.tsx          (بی‌استفاده)
     components/PanelShell.tsx        (بی‌استفاده؛ نسخهٔ درست: components/panel/PanelShell.tsx)
     components/StatusBadge.tsx       (بی‌استفاده)
     lib/session.ts                   (بی‌استفاده؛ جایگزین: lib/auth.ts)

  ⚠️ دو نکتهٔ مهم:
     الف) خودِ پوشهٔ app/admin/(panel)/ را حذف نکنید! آن نسخهٔ جدید است و
          در همین زیپ آمده. اگر فایل‌های قدیمی app/admin/* (فهرست بالا) را
          نگه دارید، چون پوشه‌های داخل پرانتز در آدرس نهایی ظاهر نمی‌شوند،
          برای یک آدرس دو صفحه می‌ماند و Next.js خطای تداخل (conflicting
          routes) می‌دهد.
     ب) app/admin/login/ و app/admin/security/ باید بمانند؛ عمداً بیرون از
          گروه (panel) هستند تا محافظِ گروه، آن‌ها را به حلقهٔ ریدایرکت
          نیندازد.

  ساختار نهایی درست app/admin/:
     app/admin/(panel)/      ← داشبورد محافظت‌شده (layout + page + orders/ …)
     app/admin/login/        ← ورود کارکنان
     app/admin/security/     ← تنظیم ورود دومرحله‌ای

  3) نصب وابستگی‌ها و اجرا:

     npm install        # qrcode در optionalDependencies است؛ بدون آن هم کار می‌کند
     npm run typecheck
     npm run dev        # یا: npm run build && npm start

  4) فایل .env.example را به .env.local کپی کنید و مقادیر را پر کنید
     (به‌ویژه SESSION_SECRET). متغیرهای امنیتی جدید:
     ADMIN_LOGIN_PATH، ADMIN_ALLOWED_IPS، ADMIN_TOTP_REQUIRED
     (توضیح کامل در README.md).

نکته: این محیط امکان build/typecheck ندارد؛ تغییرات با بازبینی کد بررسی
شده‌اند. پیش از انتشار حتماً `npm run typecheck` و `npm run build` بزنید.

حساب‌های پیش‌فرض محیط توسعه:
     مدیر:   admin / Polyrez@1405
     فروش:   sales / Sales@1405
     خریدار: 09120000000 / Buyer@1405
