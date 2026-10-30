import type { ReactNode } from "react";

type V = [number, number, number];
type Kind = "c" | "h" | "x";
type Atom = { p: V; kind: Kind };

// شعاع و رنگ اتم‌ها: کربن (آبی)، هیدروژن (روشن)، واحد تکرارشونده (نارنجی)
const RADIUS: Record<Kind, number> = { c: 0.46, h: 0.27, x: 0.5 };
const FILL: Record<Kind, string> = {
  c: "url(#m-c)",
  h: "url(#m-h)",
  x: "url(#m-x)",
};

// سه زنجیره پلی‌اتیلن موازی، هر کدام ۹ کربن با ساختار زیگزاگی
function buildChains() {
  const atoms: Atom[] = [];
  const bonds: [number, number][] = [];
  const LEN = 9;

  for (let k = 0; k < 3; k++) {
    const z0 = (k - 1) * 3.2;
    const xs = k * 0.6 - 0.6;
    let prev = -1;

    for (let i = 0; i < LEN; i++) {
      const up = i % 2 === 1;
      const x = (i - (LEN - 1) / 2) * 1.2 + xs;
      const y = up ? 0.42 : -0.42;
      const hot = k === 1 && (i === 3 || i === 4);

      const c = atoms.push({ p: [x, y, z0], kind: hot ? "x" : "c" }) - 1;
      if (prev >= 0) bonds.push([prev, c]);
      prev = c;

      for (const dz of [-0.85, 0.85]) {
        const h =
          atoms.push({ p: [x, y + (up ? 0.6 : -0.6), z0 + dz], kind: "h" }) - 1;
        bonds.push([c, h]);
      }
    }
  }
  return { atoms, bonds };
}

// چرخش در فضا و تصویر پرسپکتیو روی صفحه
const AY = -0.6;
const AX = 0.42;
const AZ = -0.12;
const S = 48;
const D = 14;
const CX = 260;
const CY = 150;

function project([x, y, z]: V) {
  const x1 = x * Math.cos(AY) + z * Math.sin(AY);
  const z1 = -x * Math.sin(AY) + z * Math.cos(AY);
  const y2 = y * Math.cos(AX) - z1 * Math.sin(AX);
  const z2 = y * Math.sin(AX) + z1 * Math.cos(AX);
  const x3 = x1 * Math.cos(AZ) - y2 * Math.sin(AZ);
  const y3 = x1 * Math.sin(AZ) + y2 * Math.cos(AZ);
  const s = D / (D - z2);
  return { x: CX + x3 * S * s, y: CY - y3 * S * s, z: z2, s };
}

export default function MoleculeHero({ className }: { className?: string }) {
  const { atoms, bonds } = buildChains();
  const P = atoms.map((a) => project(a.p));
  const zs = P.map((p) => p.z);
  const zmin = Math.min(...zs);
  const zmax = Math.max(...zs);
  const fade = (z: number) => (0.45 + (0.55 * (z - zmin)) / (zmax - zmin)).toFixed(2);

  const items: { z: number; node: ReactNode }[] = [];

  bonds.forEach(([a, b], i) => {
    const A = P[a];
    const B = P[b];
    const w = 0.17 * S * ((A.s + B.s) / 2);
    const o = w * 0.15;
    const z = (A.z + B.z) / 2;
    items.push({
      z,
      node: (
        <g key={`b${i}`} opacity={fade(z)} strokeLinecap="round">
          <line
            x1={A.x.toFixed(1)}
            y1={A.y.toFixed(1)}
            x2={B.x.toFixed(1)}
            y2={B.y.toFixed(1)}
            stroke="#3f7fa8"
            strokeWidth={w.toFixed(1)}
          />
          <line
            x1={(A.x - o).toFixed(1)}
            y1={(A.y - o).toFixed(1)}
            x2={(B.x - o).toFixed(1)}
            y2={(B.y - o).toFixed(1)}
            stroke="#cfe6f5"
            strokeWidth={(w * 0.3).toFixed(1)}
            strokeOpacity="0.7"
          />
        </g>
      ),
    });
  });

  atoms.forEach((a, i) => {
    const p = P[i];
    items.push({
      z: p.z,
      node: (
        <circle
          key={`a${i}`}
          cx={p.x.toFixed(1)}
          cy={p.y.toFixed(1)}
          r={(RADIUS[a.kind] * S * p.s).toFixed(1)}
          fill={FILL[a.kind]}
          opacity={fade(p.z)}
        />
      ),
    });
  });

  items.sort((m, n) => m.z - n.z);

  return (
    <svg
      className={`chain-reveal ${className ?? ""}`}
      viewBox="0 0 520 300"
      role="img"
      aria-label="مدل سه‌بعدی زنجیره‌های پلیمری"
    >
      <defs>
        <radialGradient id="m-c" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#8fcdf0" />
          <stop offset="0.45" stopColor="#1f78c1" />
          <stop offset="1" stopColor="#0a3354" />
        </radialGradient>
        <radialGradient id="m-h" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#f4f9fd" />
          <stop offset="0.5" stopColor="#a9cdea" />
          <stop offset="1" stopColor="#6c8fab" />
        </radialGradient>
        <radialGradient id="m-x" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffe3bf" />
          <stop offset="0.45" stopColor="#f28c28" />
          <stop offset="1" stopColor="#9a5410" />
        </radialGradient>
      </defs>
      {items.map((it) => it.node)}
    </svg>
  );
}
