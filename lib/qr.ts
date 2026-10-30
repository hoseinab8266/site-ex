import "server-only";

// تولید تصویر QR به‌صورت SVG از روی متن (مثلاً آدرس otpauth://).
// بستهٔ qrcode اختیاری است؛ اگر نصب نباشد null برگردانده می‌شود تا صفحه
// به‌جای QR، همان کلید متنی را نشان دهد و ورود دستی ممکن بماند.
export async function qrSvg(text: string): Promise<string | null> {
  try {
    // import داینامیک و غیرمستقیم تا در صورت نبود بسته، بیلد نشکند.
    const name = "qrcode";
    const mod = (await import(/* webpackIgnore: true */ name)) as {
      toString?: (t: string, o?: Record<string, unknown>) => Promise<string>;
    };
    if (!mod?.toString) return null;
    return await mod.toString(text, {
      type: "svg",
      margin: 1,
      width: 220,
      errorCorrectionLevel: "M",
      color: { dark: "#06303a", light: "#ffffff" },
    });
  } catch {
    return null;
  }
}
