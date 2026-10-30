export const ELEMENT_AVATARS = [
  { symbol: "H", name: "هیدروژن" },
  { symbol: "C", name: "کربن" },
  { symbol: "N", name: "نیتروژن" },
  { symbol: "O", name: "اکسیژن" },
  { symbol: "F", name: "فلوئور" },
  { symbol: "Si", name: "سیلیسیم" },
  { symbol: "S", name: "گوگرد" },
  { symbol: "Cl", name: "کلر" },
  { symbol: "Ca", name: "کلسیم" },
  { symbol: "Ti", name: "تیتانیوم" },
  { symbol: "Cu", name: "مس" },
  { symbol: "Zn", name: "روی" },
].map((element) => ({ ...element, url: `/avatars/${element.symbol.toLowerCase()}.svg` }));

export function isElementAvatar(url: string) {
  return ELEMENT_AVATARS.some((element) => element.url === url);
}

export function randomElementAvatar() {
  return ELEMENT_AVATARS[Math.floor(Math.random() * ELEMENT_AVATARS.length)].url;
}

export function defaultAvatarFor(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ELEMENT_AVATARS[hash % ELEMENT_AVATARS.length].url;
}

export function avatarOf(user: { id?: string; name?: string; avatar?: string }) {
  return user.avatar || defaultAvatarFor(user.id || user.name || "");
}
