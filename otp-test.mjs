import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
const require = createRequire(import.meta.url);
const ts = require("/home/claude/.npm-global/lib/node_modules/typescript");

// compile the real project files to CJS in a temp dir, stub "server-only"
const out = "/tmp/otp-build"; fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
for (const f of ["lib/bale.ts", "lib/otp-store.ts"]) {
  const src = fs.readFileSync(path.join("/home/claude/app", f), "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  fs.writeFileSync(path.join(out, path.basename(f).replace(".ts", ".js")), js);
}
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (r, ...a) { return r === "server-only" ? require.resolve("/tmp/empty.js") : origResolve.call(this, r, ...a); };
fs.writeFileSync("/tmp/empty.js", "");

// mock Safir server
const calls = [];
const server = http.createServer((req, res) => {
  let b = ""; req.on("data", c => b += c); req.on("end", () => {
    calls.push({ url: req.url, method: req.method, key: req.headers["api-access-key"], ct: req.headers["content-type"], body: JSON.parse(b) });
    const fail = calls.at(-1).key === "bad";
    res.writeHead(fail ? 401 : 200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(fail ? { error_data: [{ code: 401 }] } : {}));
  });
}).listen(0);
await new Promise(r => server.on("listening", r));
const port = server.address().port;
// redirect the hard-coded Safir URL to the mock
const realFetch = globalThis.fetch;
globalThis.fetch = (u, o) => realFetch(String(u).replace("https://safir.bale.ai", `http://127.0.0.1:${port}`), o);

process.env.OTP_SECRET = "test-secret"; process.env.BALE_BOT_ID = "123456789"; process.env.BALE_SAFIR_ACCESS_KEY = "good";
const { sendBaleOtp } = require(path.join(out, "bale.js"));
const store = require(path.join(out, "otp-store.js"));

let pass = 0, failn = 0;
const t = (name, cond) => { console.log((cond ? "PASS" : "FAIL") + "  " + name); cond ? pass++ : failn++; };

// 1. Bale request contract
await sendBaleOtp("09123456789", "482913");
const c = calls[0];
t("POST to /api/v3/send_message", c.method === "POST" && c.url === "/api/v3/send_message");
t("api-access-key header sent", c.key === "good");
t("phone converted to 98xxxxxxxxxx", c.body.phone_number === "989123456789");
t("bot_id is a number", c.body.bot_id === 123456789);
t("otp_message.otp in body", c.body.message_data?.otp_message?.otp === "482913");
t("request_id present (uuid)", /^[0-9a-f-]{36}$/.test(c.body.request_id));
// 2. provider error -> throws, generic message
process.env.BALE_SAFIR_ACCESS_KEY = "bad";
let err = ""; try { await sendBaleOtp("09123456789", "1"); } catch (e) { err = e.message; }
t("provider error throws generic message (no secrets)", err.includes("ناموفق") && !err.includes("bad"));
process.env.BALE_SAFIR_ACCESS_KEY = "good";
delete process.env.BALE_BOT_ID; err = ""; try { await sendBaleOtp("09123456789", "1"); } catch (e) { err = e.message; }
t("missing env throws config error", err.includes("تنظیمات"));
process.env.BALE_BOT_ID = "123456789";

// 3. normalizeMobile
t("normalize Persian digits", store.normalizeMobile("۰۹۱۲۳۴۵۶۷۸۹") === "09123456789");
t("normalize +98 form", store.normalizeMobile("+989123456789") === "09123456789");
t("reject invalid", store.normalizeMobile("12345") === "");

// 4. OTP create/verify
const p = "09120000001";
const { otp } = store.createOtp(p);
t("otp is 6 digits", /^\d{6}$/.test(otp));
t("wrong otp rejected", store.verifyOtp(p, otp === "000000" ? "111111" : "000000").ok === false);
t("correct otp accepted", store.verifyOtp(p, otp).ok === true);
t("otp is single-use", store.verifyOtp(p, otp).ok === false);
const { otp: o2 } = store.createOtp(p);
for (let i = 0; i < 5; i++) store.verifyOtp(p, "999999" === o2 ? "888888" : "999999");
t("locked after 5 wrong attempts (even with right code)", store.verifyOtp(p, o2).ok === false);
const { otp: o3 } = store.createOtp(p); store.clearOtp(p);
t("clearOtp invalidates code", store.verifyOtp(p, o3).ok === false);

// 5. cooldown + hourly limit
const q = "09120000002";
t("first send allowed", store.allowOtpSend(q).ok === true);
const g = store.allowOtpSend(q);
t("immediate resend blocked (cooldown) with retryAfter<=60", g.ok === false && g.reason === "cooldown" && g.retryAfter > 0 && g.retryAfter <= 60);
// simulate time passing to test hourly cap
const realNow = Date.now; let skew = 0; Date.now = () => realNow() + skew;
let allowed = 1; for (let i = 0; i < 10; i++) { skew += 61_000; if (store.allowOtpSend(q).ok) allowed++; }
t("max 5 sends per hour enforced (allowed=" + allowed + ")", allowed === 5);
skew += 61 * 60_000;
t("window resets after an hour", store.allowOtpSend(q).ok === true);
// expiry
const r = "09120000003"; const { otp: o4 } = store.createOtp(r); skew += 5 * 60_000 + 1000;
const ex = store.verifyOtp(r, o4);
t("expired after 5 minutes", ex.ok === false && ex.reason === "expired");
Date.now = realNow;

console.log(`\n${pass} passed, ${failn} failed`);
server.close(); process.exit(failn ? 1 : 0);
