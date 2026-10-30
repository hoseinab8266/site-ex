import Image from "next/image";

// لوگوی Polyrez: نسخه تیره برای پس‌زمینه روشن و نسخه سفید برای پس‌زمینه تیره
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Image
      src={light ? "/logo-light.png" : "/logo.png"}
      alt="Polyrez"
      width={521}
      height={283}
      priority
      className={light ? "h-14 w-auto" : "h-10 w-auto"}
    />
  );
}
