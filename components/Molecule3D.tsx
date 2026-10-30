"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Vector3 } from "three";

type Three = typeof import("three");
type EnvCtor =
  typeof import("three/examples/jsm/environments/RoomEnvironment.js").RoomEnvironment;

// Three.js فقط بعد از نمایش صفحه و در پس‌زمینه بارگذاری می‌شود،
// تا سرعت اولیه سایت کم نشود. تا آن زمان (یا اگر WebGL نبود) تصویر جایگزین دیده می‌شود.
export default function Molecule3D({ fallback }: { fallback: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let dead = false;
    let stop: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import("three");
        const { RoomEnvironment } = await import(
          "three/examples/jsm/environments/RoomEnvironment.js"
        );
        if (dead) return;
        stop = mount(THREE, RoomEnvironment, el);
        setReady(true);
      } catch {
        // بدون WebGL، تصویر جایگزین باقی می‌ماند
      }
    })();

    return () => {
      dead = true;
      stop?.();
    };
  }, []);

  return (
    <div
      ref={box}
      className="relative mx-auto aspect-[4/3] w-full max-w-[560px]"
    >
      <div
        aria-hidden={ready}
        className={`absolute inset-0 flex items-center transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      >
        {fallback}
      </div>
    </div>
  );
}

function mount(THREE: Three, RoomEnvironment: EnvCtor, el: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const canvas = renderer.domElement;
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .8s";
  el.appendChild(canvas);

  // نور و بازتاب: محیط داخلی (بدون فایل خارجی) + دو نور رنگی
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = env.texture;

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(5, 6, 8);
  const rim = new THREE.DirectionalLight(0xf28c28, 2.4);
  rim.position.set(-6, -2, -5);
  const fill = new THREE.PointLight(0x4aa3df, 60, 40);
  fill.position.set(-6, 4, 6);
  scene.add(key, rim, fill);

  const camera = new THREE.PerspectiveCamera(32, 4 / 3, 0.1, 100);
  camera.position.set(0, 0, 18);

  // ---------- ساخت سه زنجیره مارپیچی ----------
  const CH = 3;
  const N = 40;
  const LEN = 11;
  const TURNS = 2.4;
  const R = 1.2;

  const cPos: Vector3[] = [];
  const hPos: Vector3[] = [];
  const bonds: [Vector3, Vector3, number][] = [];

  for (let c = 0; c < CH; c++) {
    let prev: Vector3 | null = null;
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const phi = u * TURNS * Math.PI * 2 + (c * Math.PI * 2) / CH;
      const r = R + (i % 2 ? 0.14 : -0.14);
      const p = new THREE.Vector3(
        (u - 0.5) * LEN,
        r * Math.cos(phi),
        r * Math.sin(phi)
      );
      cPos.push(p);
      if (prev) bonds.push([prev, p, 0.07]);
      prev = p;

      const rad = new THREE.Vector3(0, Math.cos(phi), Math.sin(phi));
      const tan = new THREE.Vector3(0, -Math.sin(phi), Math.cos(phi));
      for (const s of [-1, 1]) {
        const h = p.clone().addScaledVector(rad, 0.62).addScaledVector(tan, 0.42 * s);
        hPos.push(h);
        bonds.push([p, h, 0.045]);
      }
    }
  }

  const sphere = new THREE.SphereGeometry(1, 32, 24);
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 12, 1, true);
  const matC = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.15,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const matH = new THREE.MeshPhysicalMaterial({
    color: 0xa9cdea,
    roughness: 0.3,
    clearcoat: 0.6,
  });
  const matB = new THREE.MeshStandardMaterial({
    color: 0x9db8cc,
    metalness: 0.6,
    roughness: 0.35,
  });

  const carbons = new THREE.InstancedMesh(sphere, matC, cPos.length);
  const hydros = new THREE.InstancedMesh(sphere, matH, hPos.length);
  const bondMesh = new THREE.InstancedMesh(cyl, matB, bonds.length);

  const dummy = new THREE.Object3D();
  const place = (mesh: typeof carbons, list: Vector3[], size: number) => {
    list.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.quaternion.identity();
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
  };
  place(carbons, cPos, 0.27);
  place(hydros, hPos, 0.15);

  const up = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3();
  bonds.forEach(([a, b, rad], i) => {
    dir.subVectors(b, a);
    const len = dir.length();
    dummy.position.copy(a).addScaledVector(dir, 0.5);
    dummy.quaternion.setFromUnitVectors(up, dir.normalize());
    dummy.scale.set(rad, len, rad);
    dummy.updateMatrix();
    bondMesh.setMatrixAt(i, dummy.matrix);
  });

  // موج نارنجی: رشد زنجیره در فرایند پلیمریزاسیون
  const blue = new THREE.Color(0x1f78c1);
  const orange = new THREE.Color(0xf28c28);
  const tmp = new THREE.Color();
  const SPAN = N + 10;
  const paint = (time: number) => {
    for (let c = 0; c < CH; c++) {
      const head = ((time * 7 + (c * SPAN) / CH) % SPAN) - 5;
      for (let i = 0; i < N; i++) {
        const k = Math.max(0, 1 - Math.abs(i - head) / 3);
        tmp.copy(blue).lerp(orange, k);
        carbons.setColorAt(c * N + i, tmp);
      }
    }
    if (carbons.instanceColor) carbons.instanceColor.needsUpdate = true;
  };
  paint(reduce ? 2 : 0);

  const outer = new THREE.Group();
  const inner = new THREE.Group();
  inner.add(carbons, hydros, bondMesh);
  outer.add(inner);
  scene.add(outer);

  // گرد و غبار ریز برای حس عمق
  const dustN = 160;
  const arr = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 20;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x9fcbe6,
    size: 0.06,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // ---------- اندازه، حرکت و ماوس ----------
  let running = false;
  let visible = true;
  let raf = 0;
  let last = 0;
  let time = 0;
  let tx = 0;
  let ty = 0;
  let sx = 0;
  let sy = 0;

  const resize = () => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = 18 * Math.max(1, 1.4 / camera.aspect);
    camera.updateProjectionMatrix();
    if (!running) renderer.render(scene, camera);
  };

  const pose = () => {
    outer.rotation.set(0.15 + sy, -0.5 + sx, -0.32);
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt;
    inner.rotation.x += dt * 0.28;
    dust.rotation.y += dt * 0.02;
    sx += (tx - sx) * 0.05;
    sy += (ty - sy) * 0.05;
    pose();
    paint(time);
    renderer.render(scene, camera);
  };

  const start = () => {
    if (running || reduce || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 0.3;
  };
  const onLeave = () => {
    tx = 0;
    ty = 0;
  };
  const onVisibility = () => (document.hidden ? pause() : start());

  const ro = new ResizeObserver(resize);
  ro.observe(el);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else pause();
  });
  io.observe(el);

  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);

  pose();
  resize();
  renderer.render(scene, camera);
  requestAnimationFrame(() => {
    canvas.style.opacity = "1";
  });
  start();

  return () => {
    pause();
    ro.disconnect();
    io.disconnect();
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    carbons.dispose();
    hydros.dispose();
    bondMesh.dispose();
    sphere.dispose();
    cyl.dispose();
    dustGeo.dispose();
    matC.dispose();
    matH.dispose();
    matB.dispose();
    dustMat.dispose();
    env.dispose();
    pmrem.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
