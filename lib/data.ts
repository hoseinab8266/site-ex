// ⚠️ همه مقادیر این فایل «نمونه» هستند (قیمت، مشخصات فنی، مقالات).
// در مرحله دیتابیس، این داده‌ها با اطلاعات واقعی جایگزین می‌شوند.

export const navItems = [
  { href: "/products", label: "محصولات" },
  { href: "/articles", label: "مقالات علمی" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

export type Spec = { label: string; value: string };

export type Product = {
  slug: string;
  badge: string;
  name: string;
  summary: string;
  specs: Spec[];
  price: number; // تومان
  unit: string;
  imageUrl?: string;
  family?: string;
  description?: string[];
  applications?: string[];
  extraSpecs?: Spec[];
  storage?: string;
  packSize?: number;
  packLabel?: string;
  stockStatus?: "available" | "out_of_stock" | "contact";
  stockQuantity?: number;
};

export type Family = { slug: string; name: string; uses: string };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  date: string;
};

export const families: Family[] = [
  {
    slug: "polyethylene",
    name: "پلی‌اتیلن",
    uses: "HDPE، LDPE و LLDPE برای لوله، فیلم و قطعات",
  },
  {
    slug: "polypropylene",
    name: "پلی‌پروپیلن",
    uses: "تزریق، الیاف و بسته‌بندی",
  },
  {
    slug: "epoxy",
    name: "رزین‌های اپوکسی",
    uses: "پوشش، چسب و کامپوزیت",
  },
  {
    slug: "pvc",
    name: "پی‌وی‌سی",
    uses: "پروفیل، لوله و عایق کابل",
  },
  {
    slug: "polyester",
    name: "رزین پلی‌استر غیراشباع",
    uses: "فایبرگلاس و قطعات قالبی",
  },
  {
    slug: "additives",
    name: "افزودنی‌ها و مستربچ",
    uses: "رنگ، پایدارکننده و بهبوددهنده خواص",
  },
];

export const products: Product[] = [
  {
    slug: "hdpe-pipe-grade",
    badge: "HDPE",
    name: "پلی‌اتیلن سنگین، گرید اکستروژن لوله",
    summary: "مناسب تولید لوله با مقاومت خوب در برابر ترک‌خوردگی تنشی.",
    specs: [
      { label: "چگالی", value: "۰٫۹۵۱ g/cm³" },
      { label: "MFI", value: "۰٫۳ g/10min" },
      { label: "بسته‌بندی", value: "کیسه ۲۵ کیلوگرمی" },
    ],
    price: 98000,
    unit: "کیلوگرم",
  },
  {
    slug: "pp-homo-injection",
    badge: "PP",
    name: "پلی‌پروپیلن هموپلیمر، گرید تزریق",
    summary: "جریان‌پذیری بالا برای قطعات تزریقی نازک و ظروف خانگی.",
    specs: [
      { label: "چگالی", value: "۰٫۹۰۵ g/cm³" },
      { label: "MFI", value: "۱۲ g/10min" },
      { label: "بسته‌بندی", value: "کیسه ۲۵ کیلوگرمی" },
    ],
    price: 87000,
    unit: "کیلوگرم",
  },
  {
    slug: "epoxy-liquid-dgeba",
    badge: "EP",
    name: "رزین اپوکسی مایع، پایه بیسفنول A",
    summary: "رزین عمومی برای پوشش کف، چسب صنعتی و ساخت کامپوزیت.",
    specs: [
      { label: "وزن اپوکسی", value: "۱۸۲ تا ۱۹۲ g/eq" },
      { label: "ویسکوزیته", value: "۱۱٬۰۰۰ تا ۱۴٬۰۰۰ mPa·s" },
      { label: "بسته‌بندی", value: "گالن ۵ کیلوگرمی" },
    ],
    price: 245000,
    unit: "کیلوگرم",
  },
  {
    slug: "pvc-suspension-k67",
    badge: "PVC",
    name: "رزین پی‌وی‌سی سوسپانسیونی، K-value ۶۷",
    summary: "برای تولید لوله، اتصالات و پروفیل‌های سخت.",
    specs: [
      { label: "K-value", value: "۶۷" },
      { label: "چگالی توده", value: "۰٫۵۰ g/cm³" },
      { label: "بسته‌بندی", value: "کیسه ۲۵ کیلوگرمی" },
    ],
    price: 52000,
    unit: "کیلوگرم",
  },
];

export const articles: Article[] = [
  {
    slug: "what-is-mfi",
    title: "شاخص جریان مذاب (MFI) چیست و چطور گرید مناسب را انتخاب کنیم؟",
    excerpt:
      "MFI یکی از اولین عددهایی است که روی برگه فنی پلیمر می‌بینید. یاد می‌گیرید این عدد چه چیزی را می‌گوید و برای اکستروژن، تزریق و فیلم چه بازه‌ای مناسب است.",
    category: "راهنمای انتخاب گرید",
    readMinutes: 8,
    date: "۲۶ مهر ۱۴۰۵",
  },
  {
    slug: "epoxy-mix-ratio",
    title: "رزین اپوکسی: نسبت اختلاط، زمان ژل‌شدن و استحکام نهایی",
    excerpt:
      "چرا نسبت اشتباه سخت‌کننده باعث چسبناک ماندن سطح می‌شود و دما چه تأثیری بر زمان کار دارد.",
    category: "رزین‌ها",
    readMinutes: 6,
    date: "۱۹ مهر ۱۴۰۵",
  },
  {
    slug: "hdpe-vs-ldpe",
    title: "پلی‌اتیلن سنگین یا سبک؟ مقایسه کاربردی برای لوله، فیلم و تزریق",
    excerpt:
      "تفاوت ساختار مولکولی چگونه به تفاوت در استحکام، انعطاف و فرایندپذیری تبدیل می‌شود.",
    category: "پلی‌اولفین‌ها",
    readMinutes: 7,
    date: "۱۲ مهر ۱۴۰۵",
  },
  {
    slug: "polymer-storage",
    title: "انبارداری مواد پلیمری و جلوگیری از جذب رطوبت",
    excerpt:
      "رطوبت و نور مستقیم چه آسیبی به گرانول و رزین می‌زنند و بسته‌های باز شده را چطور نگه داریم.",
    category: "کاربرد و نگهداری",
    readMinutes: 5,
    date: "۵ مهر ۱۴۰۵",
  },
];

// ⚠️ ایمیل و آدرس نمونه است؛ قبل از انتشار با اطلاعات واقعی جایگزین شود.
export const contact = {
  phone: "۰۲۱-۸۲۸۸۴۹۵۹",
  email: "info@polyrez.ir",
  address: "تهران، آدرس شرکت را اینجا بنویسید",
  hours: "شنبه تا چهارشنبه، ۹ تا ۱۷",
};
