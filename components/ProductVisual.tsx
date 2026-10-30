import type { ReactNode } from "react";

// تولید عدد تصادفی ثابت (تا خروجی هر بار یکسان باشد)
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function Shadow({ rx = 110 }: { rx?: number }) {
  return (
    <>
      <defs>
        <radialGradient id="sh">
          <stop offset="0" stopColor="#0b2545" stopOpacity="0.3" />
          <stop offset="1" stopColor="#0b2545" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="154" rx={rx} ry="9" fill="url(#sh)" />
    </>
  );
}

// گرانول پلیمری: تپه‌ای از دانه‌های استوانه‌ای (HDPE، PP و ...)
function Granules({
  kind,
  tones,
}: {
  kind: string;
  tones: [string, string, string];
}) {
  const rand = rng(kind.length * 131 + kind.charCodeAt(0));
  const items: ReactNode[] = [];

  for (let r = 5; r >= 0; r--) {
    const n = 11 - r * 2;
    for (let i = 0; i < n; i++) {
      const cx = 160 + (i - (n - 1) / 2) * 21 + (rand() - 0.5) * 5;
      const cy = 146 - r * 14 + (rand() - 0.5) * 4;
      const rot = Math.round(rand() * 180);
      items.push(
        <g
          key={`${r}-${i}`}
          transform={`rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})`}
        >
          <ellipse
            cx={cx.toFixed(1)}
            cy={cy.toFixed(1)}
            rx="11"
            ry="6.5"
            fill={`url(#g-${kind})`}
          />
          <ellipse
            cx={(cx - 3).toFixed(1)}
            cy={(cy - 2.2).toFixed(1)}
            rx="3.6"
            ry="1.6"
            fill="#ffffff"
            opacity="0.75"
          />
        </g>
      );
    }
  }

  return (
    <>
      <Shadow rx={135} />
      <defs>
        <radialGradient id={`g-${kind}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={tones[0]} />
          <stop offset="0.55" stopColor={tones[1]} />
          <stop offset="1" stopColor={tones[2]} />
        </radialGradient>
      </defs>
      {items}
    </>
  );
}

// رزین مایع: بشر شیشه‌ای با رزین کهربایی و همزن
function Beaker() {
  return (
    <>
      <Shadow rx={82} />
      <defs>
        <linearGradient id="epoxy" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6dfa0" />
          <stop offset="1" stopColor="#d9a43a" />
        </linearGradient>
      </defs>
      <path
        d="M112 36 H208 V142 Q208 152 198 152 H122 Q112 152 112 142 Z"
        fill="#ffffff"
        fillOpacity="0.45"
        stroke="#9fb7c9"
        strokeWidth="2"
      />
      <path
        d="M113 84 H207 V142 Q207 151 198 151 H122 Q113 151 113 142 Z"
        fill="url(#epoxy)"
      />
      <ellipse cx="160" cy="84" rx="47" ry="4.5" fill="#fbecb8" />
      <line
        x1="190"
        y1="18"
        x2="148"
        y2="138"
        stroke="#5c7186"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="189"
        y1="18"
        x2="147"
        y2="138"
        stroke="#a9bccc"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {[52, 68, 100, 116, 132].map((y) => (
        <line
          key={y}
          x1="196"
          y1={y}
          x2="207"
          y2={y}
          stroke="#7d96aa"
          strokeWidth="1.5"
        />
      ))}
      <rect
        x="119"
        y="42"
        width="6"
        height="96"
        rx="3"
        fill="#ffffff"
        opacity="0.6"
      />
      <path
        d="M106 36 H214"
        stroke="#9fb7c9"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
}

// پودر (مثل PVC): تپه‌ای نرم از ذرات ریز سفید
function Powder() {
  const rand = rng(7);
  const dots: ReactNode[] = [];
  let tries = 0;

  while (dots.length < 80 && tries < 500) {
    tries++;
    const x = 40 + rand() * 240;
    const y = 70 + rand() * 80;
    const e = ((x - 160) / 122) ** 2 + ((y - 150) / 82) ** 2;
    if (e < 0.92 && y < 148) {
      dots.push(
        <circle
          key={dots.length}
          cx={x.toFixed(1)}
          cy={y.toFixed(1)}
          r={(0.7 + rand() * 1.1).toFixed(1)}
          fill={dots.length % 2 ? "#c4d3df" : "#ffffff"}
        />
      );
    }
  }

  return (
    <>
      <Shadow rx={135} />
      <defs>
        <radialGradient id="powder" cx="0.5" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#eef3f7" />
          <stop offset="1" stopColor="#b9cad8" />
        </radialGradient>
      </defs>
      <path
        d="M38 150 C72 150 96 84 160 66 C224 84 248 150 282 150 Z"
        fill="url(#powder)"
      />
      {dots}
    </>
  );
}

export default function ProductVisual({ kind }: { kind: string }) {
  let art: ReactNode;

  if (kind === "EP") art = <Beaker />;
  else if (kind === "PVC") art = <Powder />;
  else if (kind === "PP")
    art = <Granules kind="PP" tones={["#ffffff", "#e3eef6", "#9fb7c9"]} />;
  else art = <Granules kind="HDPE" tones={["#ffffff", "#efe8d6", "#b8aa88"]} />;

  return (
    <div className="bg-gradient-to-b from-brand-soft to-white">
      <svg viewBox="0 0 320 176" className="h-44 w-full" aria-hidden="true">
        {art}
      </svg>
    </div>
  );
}
