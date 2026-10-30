# تغییرات: مقالات، سبد خرید، درباره ما

ساختار پوشه‌ها دقیقاً مثل پروژه است؛ کافی است محتوای این پوشه را روی ریشه پروژه کپی کنید (فایل‌های هم‌نام جایگزین می‌شوند).

## فایل‌های جدید
- app/cart/page.tsx                  صفحه سبد خرید
- app/articles/page.tsx              فهرست مقالات با فیلتر دسته‌بندی (?category=)
- app/articles/[slug]/page.tsx       صفحه تک‌مقاله
- app/about/page.tsx                 درباره ما
- components/CartProvider.tsx        state سبد (ذخیره در localStorage، همگام بین تب‌ها)
- components/CartLink.tsx            دکمه سبد هدر با نشانگر تعداد
- components/CartView.tsx            محتوای تعاملی صفحه سبد
- components/ArticleCard.tsx         کارت مقاله
- lib/article-content.ts             متن نمونه مقالات (نیاز به بازبینی)

## فایل‌های ویرایش‌شده
- app/layout.tsx                     پوشاندن سایت با CartProvider
- components/Header.tsx              لینک سبد ← CartLink
- components/ProductBuyBox.tsx       دکمه «افزودن به سبد» حالا واقعاً به سبد اضافه می‌کند (prop جدید: slug)
- app/products/[slug]/page.tsx       فقط پاس‌دادن slug به ProductBuyBox
