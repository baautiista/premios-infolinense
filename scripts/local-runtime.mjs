// Emulación local de los servicios de Cloudflare para pruebas: D1 (sobre node:sqlite),
// R2 (sobre el sistema de archivos) y ASSETS. En producción se usan los servicios reales.
import { DatabaseSync } from "node:sqlite";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

function checkParams(params) {
  return params.map((p) => {
    if (p === undefined) throw new Error("D1_TYPE_ERROR: Type 'undefined' not supported for value 'undefined'");
    if (typeof p === "boolean") throw new Error("D1_TYPE_ERROR: booleans no admitidos (usa 0/1)");
    return p;
  });
}

class Stmt {
  constructor(db, sql, params = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }
  bind(...params) {
    return new Stmt(this.db, this.sql, params);
  }
  _prepare() {
    return this.db.prepare(this.sql);
  }
  async first(col) {
    const row = this._prepare().get(...checkParams(this.params));
    if (!row) return null;
    const plain = { ...row };
    return col ? plain[col] : plain;
  }
  async all() {
    const rows = this._prepare().all(...checkParams(this.params)).map((r) => ({ ...r }));
    return { results: rows, success: true, meta: {} };
  }
  async run() {
    const stmt = this._prepare();
    if (/\bRETURNING\b/i.test(this.sql)) {
      const rows = stmt.all(...checkParams(this.params));
      return { success: true, results: rows, meta: { changes: rows.length } };
    }
    const r = stmt.run(...checkParams(this.params));
    return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
  }
  async raw() {
    return this._prepare().all(...checkParams(this.params)).map((r) => Object.values(r));
  }
}

export class LocalD1 {
  constructor(file = ":memory:") {
    this.db = new DatabaseSync(file);
    this.db.exec("PRAGMA foreign_keys = ON;");
  }
  prepare(sql) {
    return new Stmt(this.db, sql);
  }
  /** Como en D1: las sentencias de un batch se ejecutan en una transacción. */
  async batch(stmts) {
    this.db.exec("BEGIN");
    try {
      const out = [];
      for (const s of stmts) out.push(await s.run());
      this.db.exec("COMMIT");
      return out;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  async exec(sql) {
    this.db.exec(sql);
    return { count: 1 };
  }
  async migrate(dir) {
    for (const f of (await readdir(dir)).filter((x) => x.endsWith(".sql")).sort()) {
      this.db.exec(await readFile(path.join(dir, f), "utf8"));
    }
  }
}

export class LocalR2 {
  constructor(dir) {
    this.dir = dir;
  }
  async put(key, body, opts = {}) {
    const file = path.join(this.dir, key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, Buffer.from(body));
    await writeFile(`${file}.meta.json`, JSON.stringify(opts.httpMetadata ?? {}));
    return { key };
  }
  async get(key) {
    const file = path.join(this.dir, key);
    if (!existsSync(file)) return null;
    const data = await readFile(file);
    const meta = JSON.parse(await readFile(`${file}.meta.json`, "utf8").catch(() => "{}"));
    return {
      body: new Response(data).body,
      httpEtag: `"${(await stat(file)).mtimeMs}"`,
      writeHttpMetadata(h) {
        if (meta.contentType) h.set("Content-Type", meta.contentType);
      },
    };
  }
}

const MIME = { ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json", ".txt": "text/plain" };

export function localAssets(dir) {
  return {
    async fetch(req) {
      const url = new URL(typeof req === "string" ? req : req.url);
      const file = path.join(dir, decodeURIComponent(url.pathname));
      if (!file.startsWith(dir) || !existsSync(file) || (await stat(file)).isDirectory()) return new Response("Not found", { status: 404 });
      return new Response(await readFile(file), {
        headers: { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
      });
    },
  };
}

/** Crea un entorno completo con datos iniciales y un administrador de prueba. */
export async function createEnv(root, { file = ":memory:", mediaDir, vars = {} } = {}) {
  const DB = new LocalD1(file);
  await DB.migrate(path.join(root, "migrations"));
  return {
    DB,
    MEDIA: new LocalR2(mediaDir ?? path.join(root, ".data", "media")),
    ASSETS: localAssets(path.join(root, "dist", "client")),
    SITE_URL: "http://localhost:8787",
    ENVIRONMENT: "test",
    VOTE_PEPPER: "pepper-de-pruebas-0123456789abcdef",
    SESSION_SECRET: "sesion-de-pruebas-0123456789abcdef",
    TURNSTILE_SITE_KEY: "",
    ...vars,
  };
}
