// Servidor local que ejecuta el Worker compilado con D1/R2 emulados.
// Uso: npm run dev  (o: node scripts/dev-server.mjs --phase=voting)
// Crea un administrador de prueba: admin@premios.local / premios-local-2026
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { createEnv, localAssets } from "./local-runtime.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const port = Number(args.port ?? 8787);
await mkdir(path.join(root, ".data"), { recursive: true });

const worker = (await import(path.join(root, "dist/worker/index.js"))).default;
const env = await createEnv(root, { vars: { ENVIRONMENT: "development", SITE_URL: `http://localhost:${port}` } });

// Administrador local
const salt = Buffer.from(webcrypto.getRandomValues(new Uint8Array(16))).toString("base64");
const key = await webcrypto.subtle.importKey("raw", new TextEncoder().encode("premios-local-2026"), "PBKDF2", false, ["deriveBits"]);
const bits = await webcrypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: Buffer.from(salt, "base64"), iterations: 100000 }, key, 256);
await env.DB.prepare("INSERT INTO admin_users (email, name, role, password_hash, password_salt, iterations) VALUES (?1, ?2, 'admin', ?3, ?4, 100000)")
  .bind("admin@premios.local", "Administración local", Buffer.from(bits).toString("hex"), salt)
  .run();

if (args.phase) await env.DB.prepare("UPDATE settings SET value = ?1 WHERE key = 'phase'").bind(args.phase).run();

const assets = localAssets(path.join(root, "dist", "client"));

http
  .createServer(async (req, res) => {
    const url = `http://localhost:${port}${req.url}`;
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
    headers.set("CF-Connecting-IP", req.headers["x-test-ip"] ?? req.socket.remoteAddress ?? "127.0.0.1");
    const request = new Request(url, { method: req.method, headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : body });
    // Como en Cloudflare: primero archivos estáticos, después el Worker.
    let response = req.method === "GET" ? await assets.fetch(request) : null;
    if (!response || response.status === 404) response = await worker.fetch(request, env);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    const setCookies = response.headers.getSetCookie?.() ?? [];
    if (setCookies.length) res.setHeader("set-cookie", setCookies);
    res.end(Buffer.from(await response.arrayBuffer()));
  })
  .listen(port, () => console.log(`Premios InfoLinense en http://localhost:${port} (panel: /admin · admin@premios.local / premios-local-2026)`));
