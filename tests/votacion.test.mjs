// Pruebas del sistema de votación: duplicados, manipulaciones, fases y confidencialidad.
// Ejecutan el Worker compilado (dist/worker) contra una base de datos SQLite en memoria
// con el mismo esquema que D1. Uso: npm test
import { test, describe, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";
import { createEnv } from "../scripts/local-runtime.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worker = (await import(path.join(root, "dist/worker/index.js"))).default;

const UA_A = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1";
const UA_B = "Mozilla/5.0 (Linux; Android 15) Chrome/131 Mobile";
let env;
let realFetch = globalThis.fetch;

async function call(pathname, { method = "GET", body, ip = "203.0.113.10", ua = UA_A, cookie, headers = {} } = {}) {
  const h = new Headers({ "CF-Connecting-IP": ip, "User-Agent": ua, "Accept-Language": "es-ES", ...headers });
  if (body !== undefined) h.set("Content-Type", "application/json");
  if (cookie) h.set("Cookie", cookie);
  const res = await worker.fetch(new Request(`http://localhost:8787${pathname}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) }), env);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* HTML */
  }
  const setCookie = res.headers.get("Set-Cookie");
  return { status: res.status, json, text, cookie: setCookie ? setCookie.split(";")[0] : null, headers: res.headers };
}

async function setPhase(phase, extra = {}) {
  await env.DB.prepare("UPDATE settings SET value = ?1 WHERE key = 'phase'").bind(phase).run();
  // Las pruebas no dependen de las fechas que traigan las migraciones.
  await env.DB.prepare("UPDATE settings SET value = NULL WHERE key IN ('announce_at','voting_opens_at','voting_closes_at','results_at')").run();
  for (const [k, v] of Object.entries(extra)) await env.DB.prepare("UPDATE settings SET value = ?1 WHERE key = ?2").bind(v, k).run();
}

async function catAndNominees(slug) {
  const c = await env.DB.prepare("SELECT id FROM categories WHERE slug = ?1").bind(slug).first();
  const { results } = await env.DB.prepare("SELECT id, published, is_alternate FROM nominees WHERE category_id = ?1 ORDER BY id").bind(c.id).all();
  return { categoryId: c.id, nominees: results };
}

async function count(sql, ...p) {
  return (await env.DB.prepare(sql).bind(...p).first()).n;
}

async function createAdmin(email, password, role = "admin") {
  const salt = Buffer.from(webcrypto.getRandomValues(new Uint8Array(16))).toString("base64");
  const key = await webcrypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await webcrypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: Buffer.from(salt, "base64"), iterations: 100000 }, key, 256);
  await env.DB.prepare("INSERT INTO admin_users (email, name, role, password_hash, password_salt, iterations) VALUES (?1, ?2, ?3, ?4, ?5, 100000)")
    .bind(email, email, role, Buffer.from(bits).toString("hex"), salt)
    .run();
}

async function adminLogin(email = "admin@test.local", password = "contraseña-de-prueba-larga") {
  const r = await call("/api/admin/login", { method: "POST", body: { email, password }, headers: { "X-Premios-Admin": "1" } });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  return r.cookie;
}
const admin = (cookie) => ({ cookie, headers: { "X-Premios-Admin": "1" } });

beforeEach(async () => {
  globalThis.fetch = realFetch;
  env = await createEnv(root);
  await createAdmin("admin@test.local", "contraseña-de-prueba-larga", "admin");
  await createAdmin("editor@test.local", "contraseña-de-prueba-larga", "editor");
  await setPhase("voting");
});

describe("Votación: flujo correcto", () => {
  test("registra una papeleta con varias categorías y devuelve un comprobante", async () => {
    const a = await catAndNominees("merito-deportivo");
    const b = await catAndNominees("carnaval-linense");
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id, [b.categoryId]: b.nominees[2].id } } });
    assert.equal(r.status, 201, JSON.stringify(r.json));
    assert.match(r.json.receipt, /^PI26-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    assert.equal(await count("SELECT COUNT(*) AS n FROM votes"), 2);
    assert.equal(await count("SELECT COUNT(*) AS n FROM ballots WHERE status = 'valid'"), 1);
    // La papeleta no guarda la IP en claro.
    const row = await env.DB.prepare("SELECT * FROM ballots").first();
    assert.ok(!JSON.stringify(row).includes("203.0.113.10"));
    // Comprobante
    const chk = await call("/api/vote/receipt", { method: "POST", body: { code: r.json.receipt } });
    assert.equal(chk.json.found, true);
    assert.equal(chk.json.status, "registrada");
  });

  test("permite saltarse categorías (votar solo en una)", async () => {
    const a = await catAndNominees("arte-con-firma");
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[1].id } } });
    assert.equal(r.status, 201);
  });

  test("rechaza la papeleta vacía", async () => {
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: {} } });
    assert.equal(r.status, 400);
    assert.equal(r.json.error, "empty_ballot");
  });
});

describe("Votación: duplicados", () => {
  test("el mismo dispositivo (cookie) no puede votar dos veces", async () => {
    const a = await catAndNominees("merito-deportivo");
    const first = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
    assert.equal(first.status, 201);
    const again = await call("/api/vote/ballot", { method: "POST", cookie: first.cookie, ip: "198.51.100.7", body: { selections: { [a.categoryId]: a.nominees[1].id } } });
    assert.equal(again.status, 409);
    assert.equal(again.json.error, "already_voted");
    assert.equal(await count("SELECT COUNT(*) AS n FROM ballots"), 1);
  });

  test("borrar las cookies no basta: el identificador guardado en el navegador lo detecta", async () => {
    const a = await catAndNominees("merito-deportivo");
    const first = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
    const again = await call("/api/vote/ballot", {
      method: "POST",
      ip: "198.51.100.8",
      ua: UA_B,
      body: { selections: { [a.categoryId]: a.nominees[1].id }, deviceToken: first.json.deviceToken },
    });
    assert.equal(again.status, 409);
  });

  test("borrar cookies y almacenamiento desde el mismo navegador y red: la papeleta queda en revisión", async () => {
    const a = await catAndNominees("merito-deportivo");
    await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
    const again = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
    assert.equal(again.status, 201, "la respuesta no revela el criterio de revisión");
    const row = await env.DB.prepare("SELECT status, flags FROM ballots ORDER BY id DESC").first();
    assert.equal(row.status, "review");
    assert.match(row.flags, /mismo_navegador_y_red/);
  });

  test("una red compartida no bloquea a personas distintas, pero el volumen inusual pasa a revisión", async () => {
    await setPhase("voting", { soft_network_limit: "2", hard_network_limit: "4" });
    const a = await catAndNominees("vida-asociativa");
    const uas = ["UA-1", "UA-2", "UA-3", "UA-4", "UA-5"];
    const statuses = [];
    for (const ua of uas) {
      const r = await call("/api/vote/ballot", { method: "POST", ip: "192.0.2.50", ua, body: { selections: { [a.categoryId]: a.nominees[0].id } } });
      statuses.push(r.status);
    }
    assert.deepEqual(statuses, [201, 201, 201, 201, 429]);
    const { results } = await env.DB.prepare("SELECT status FROM ballots ORDER BY id").all();
    assert.deepEqual(results.map((r) => r.status), ["valid", "valid", "review", "review"]);
    assert.equal(await count("SELECT COUNT(*) AS n FROM security_events WHERE type = 'network_hard_limit'"), 1);
  });

  test("envíos simultáneos desde el mismo dispositivo: solo cuenta uno", async () => {
    const a = await catAndNominees("merito-deportivo");
    const first = await call("/api/vote/status", {});
    const results = await Promise.all(
      [0, 1, 2, 3, 4].map(() => call("/api/vote/ballot", { method: "POST", cookie: first.cookie, body: { selections: { [a.categoryId]: a.nominees[0].id } } })),
    );
    assert.equal(results.filter((r) => r.status === 201).length, 1);
    assert.equal(await count("SELECT COUNT(*) AS n FROM ballots"), 1);
  });

  test("un identificador de dispositivo falsificado no se acepta", async () => {
    const a = await catAndNominees("merito-deportivo");
    const forged = "v1.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.0123456789abcdef0123456789abcdef";
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id }, deviceToken: forged } });
    assert.equal(r.status, 201);
    const row = await env.DB.prepare("SELECT device_hash FROM ballots").first();
    assert.ok(row.device_hash.length === 64);
  });
});

describe("Votación: manipulaciones desde el navegador", () => {
  test("candidatura de otra categoría", async () => {
    const a = await catAndNominees("merito-deportivo");
    const b = await catAndNominees("carnaval-linense");
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: b.nominees[0].id } } });
    assert.equal(r.status, 400);
    assert.equal(r.json.error, "invalid_selection");
    assert.equal(await count("SELECT COUNT(*) AS n FROM ballots"), 0);
    assert.equal(await count("SELECT COUNT(*) AS n FROM security_events WHERE type = 'ballot_tampered'"), 1);
  });

  test("candidatura alternativa no publicada (Grupo MoM)", async () => {
    const a = await catAndNominees("talento-emprendedor");
    const alt = a.nominees.find((n) => n.is_alternate === 1);
    assert.ok(alt);
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: alt.id } } });
    assert.equal(r.status, 400);
  });

  test("categoría sin votación (Honor a la Trayectoria)", async () => {
    const h = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'honor-a-la-trayectoria'").first();
    const n = await env.DB.prepare("INSERT INTO nominees (category_id, slug, name) VALUES (?1, 'honor-prueba', 'Prueba') RETURNING id").bind(h.id).first();
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [h.id]: n.id } } });
    assert.equal(r.status, 400);
  });

  test("tipos y estructuras no válidas", async () => {
    const a = await catAndNominees("merito-deportivo");
    for (const selections of [[a.nominees[0].id], { [a.categoryId]: String(a.nominees[0].id) }, { abc: 1 }, { [a.categoryId]: -1 }, { [a.categoryId]: 1.5 }, null]) {
      const r = await call("/api/vote/ballot", { method: "POST", body: { selections } });
      assert.equal(r.status, 400, JSON.stringify(selections));
    }
    assert.equal(await count("SELECT COUNT(*) AS n FROM ballots"), 0);
  });

  test("el disparador de la base de datos impide votos incoherentes aunque fallara la aplicación", async () => {
    const a = await catAndNominees("merito-deportivo");
    const b = await catAndNominees("carnaval-linense");
    await env.DB.prepare("INSERT INTO ballots (edition_id, device_hash, receipt_hash, local_day, created_at) VALUES (1, 'x', 'y', '2026-12-01', '2026-12-01')").run();
    await assert.rejects(() => env.DB.prepare("INSERT INTO votes (ballot_id, category_id, nominee_id) VALUES (1, ?1, ?2)").bind(a.categoryId, b.nominees[0].id).run(), /vote_category_mismatch/);
    await env.DB.prepare("INSERT INTO votes (ballot_id, category_id, nominee_id) VALUES (1, ?1, ?2)").bind(a.categoryId, a.nominees[0].id).run();
    await assert.rejects(() => env.DB.prepare("UPDATE votes SET nominee_id = ?1").bind(a.nominees[1].id).run(), /votes_are_immutable/);
  });

  test("cuerpo demasiado grande o tipo de contenido incorrecto", async () => {
    const big = await call("/api/vote/ballot", { method: "POST", body: { selections: {}, pad: "x".repeat(20000) } });
    assert.equal(big.status, 413);
    const res = await worker.fetch(new Request("http://localhost/api/vote/ballot", { method: "POST", body: "selections=1", headers: { "Content-Type": "application/x-www-form-urlencoded" } }), env);
    assert.equal(res.status, 415);
  });
});

describe("Votación: Turnstile y límites", () => {
  test("en producción, sin token anti-bots se rechaza", async () => {
    env.ENVIRONMENT = "production";
    env.TURNSTILE_SITE_KEY = "0x4AAAAAAA-prueba";
    env.TURNSTILE_SECRET = "0x4AAAAAAA-secreto";
    const a = await catAndNominees("merito-deportivo");
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
    assert.equal(r.status, 403);
    assert.equal(r.json.error, "bot_check_failed");
  });

  test("en producción, Turnstile rechazado por Cloudflare", async () => {
    env.ENVIRONMENT = "production";
    env.TURNSTILE_SITE_KEY = "0x4AAAAAAA-prueba";
    env.TURNSTILE_SECRET = "0x4AAAAAAA-secreto";
    globalThis.fetch = async () => new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }));
    const a = await catAndNominees("merito-deportivo");
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id }, turnstileToken: "token-falso-123456" } });
    assert.equal(r.status, 403);
    assert.equal(await count("SELECT COUNT(*) AS n FROM security_events WHERE type = 'turnstile_failed'"), 1);
  });

  test("en producción, Turnstile válido permite votar", async () => {
    env.ENVIRONMENT = "production";
    env.SITE_URL = "https://premios.infolinense.com";
    env.TURNSTILE_SITE_KEY = "0x4AAAAAAA-prueba";
    env.TURNSTILE_SECRET = "0x4AAAAAAA-secreto";
    globalThis.fetch = async () => new Response(JSON.stringify({ success: true, action: "ballot", hostname: "premios.infolinense.com" }));
    const a = await catAndNominees("merito-deportivo");
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id }, turnstileToken: "token-valido-123456" } });
    assert.equal(r.status, 201);
  });

  test("en producción, sin secretos configurados la votación no se abre (no finge funcionar)", async () => {
    env.ENVIRONMENT = "production";
    delete env.TURNSTILE_SECRET;
    const a = await catAndNominees("merito-deportivo");
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
    assert.equal(r.status, 503);
  });

  test("limitación de intentos por conexión", async () => {
    let last;
    for (let i = 0; i < 31; i++) last = await call("/api/vote/ballot", { method: "POST", ip: "192.0.2.99", body: { selections: {} } });
    assert.equal(last.status, 429);
  });
});

describe("Fases de la edición", () => {
  test("no se puede votar antes de abrir ni después de cerrar", async () => {
    const a = await catAndNominees("merito-deportivo");
    for (const phase of ["coming_soon", "nominations", "closed", "winners"]) {
      await setPhase(phase);
      const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
      assert.equal(r.status, 403, phase);
    }
  });

  test("la fecha de cierre cierra la votación automáticamente", async () => {
    await setPhase("voting", { voting_closes_at: new Date(Date.now() - 1000).toISOString() });
    const a = await catAndNominees("merito-deportivo");
    const r = await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
    assert.equal(r.status, 403);
    const home = await call("/");
    assert.match(home.text, /Votaciones finalizadas/);
  });

  test("antes de la presentación no se muestran candidaturas", async () => {
    await setPhase("coming_soon");
    const nominee = await call("/nominados/alfredo-mena");
    assert.equal(nominee.status, 404);
    const cat = await call("/categorias/merito-deportivo");
    assert.doesNotMatch(cat.text, /Alfredo Mena/);
  });

  test("las candidaturas alternativas nunca aparecen en la web", async () => {
    await setPhase("nominations");
    const cat = await call("/categorias/talento-emprendedor");
    assert.match(cat.text, /Xora Intelligence/);
    assert.doesNotMatch(cat.text, /Grupo MoM/);
    assert.equal((await call("/nominados/grupo-mom")).status, 404);
  });

  test("los ganadores no se publican antes de la fecha oficial", async () => {
    const a = await catAndNominees("merito-deportivo");
    await env.DB.prepare("UPDATE categories SET winner_nominee_id = ?1, winner_reason = 'Motivo' WHERE id = ?2").bind(a.nominees[0].id, a.categoryId).run();
    await setPhase("winners", { results_at: new Date(Date.now() + 3600_000).toISOString() });
    const early = await call("/api/page?path=/ganadores");
    assert.equal(early.json.data.published, false);
    assert.equal(early.json.data.awards.length, 0);
    assert.equal((await call("/ganadores/alfredo-mena")).status, 404);
    await setPhase("winners", { results_at: new Date(Date.now() - 1000).toISOString() });
    const now = await call("/api/page?path=/ganadores");
    assert.equal(now.json.data.published, true);
    assert.equal(now.json.data.awards[0].winner.name, "Alfredo Mena");
  });
});

describe("Confidencialidad de resultados", () => {
  test("ningún endpoint público expone recuentos", async () => {
    const a = await catAndNominees("merito-deportivo");
    await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
    for (const p of ["/", "/categorias", "/categorias/merito-deportivo", "/nominados/alfredo-mena", "/votar", "/ganadores", "/palmares"]) {
      const r = await call(`/api/page?path=${encodeURIComponent(p)}`);
      assert.doesNotMatch(r.text, /"(votes|valid|review|annulled|vote_count|total_votes)"\s*:/, p);
    }
    const status = await call("/api/vote/status");
    assert.deepEqual(Object.keys(status.json).sort(), ["alreadyVoted", "closesAt", "configured", "deviceToken", "ok", "phase", "votingOpen"]);
  });

  test("los resultados requieren sesión de administración", async () => {
    assert.equal((await call("/api/admin/results", { headers: { "X-Premios-Admin": "1" } })).status, 401);
    const editor = await adminLogin("editor@test.local");
    assert.equal((await call("/api/admin/results", admin(editor))).status, 403);
    const cookie = await adminLogin();
    const r = await call("/api/admin/results", admin(cookie));
    assert.equal(r.status, 200);
  });
});

describe("Panel de administración", () => {
  test("credenciales incorrectas y bloqueo por intentos", async () => {
    let r;
    for (let i = 0; i < 6; i++) r = await call("/api/admin/login", { method: "POST", body: { email: "admin@test.local", password: "mal" }, headers: { "X-Premios-Admin": "1" } });
    assert.equal(r.status, 429);
    assert.ok((await count("SELECT COUNT(*) AS n FROM security_events WHERE type LIKE 'admin_login%'")) >= 5);
  });

  test("protección CSRF: sin la cabecera propia o desde otro origen se rechaza", async () => {
    const cookie = await adminLogin();
    assert.equal((await call("/api/admin/overview", { cookie })).status, 403);
    assert.equal((await call("/api/admin/overview", { cookie, headers: { "X-Premios-Admin": "1", Origin: "https://evil.example" } })).status, 403);
    assert.equal((await call("/api/admin/overview", admin(cookie))).status, 200);
  });

  test("anular exige motivo y queda en una auditoría inalterable", async () => {
    const a = await catAndNominees("merito-deportivo");
    await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
    const id = (await env.DB.prepare("SELECT id FROM ballots").first()).id;
    const cookie = await adminLogin();
    const noReason = await call("/api/admin/ballots/annul", { method: "POST", body: { ids: [id] }, ...admin(cookie) });
    assert.equal(noReason.status, 400);
    const ok = await call("/api/admin/ballots/annul", { method: "POST", body: { ids: [id], reason: "Prueba de anulación" }, ...admin(cookie) });
    assert.equal(ok.json.changed, 1);
    const row = await env.DB.prepare("SELECT status, reviewed_by, review_reason FROM ballots WHERE id = ?1").bind(id).first();
    assert.deepEqual({ ...row }, { status: "annulled", reviewed_by: "admin@test.local", review_reason: "Prueba de anulación" });
    const log = await env.DB.prepare("SELECT * FROM audit_log WHERE action = 'ballots.annul'").first();
    assert.equal(log.actor, "admin@test.local");
    await assert.rejects(() => env.DB.prepare("UPDATE audit_log SET reason = 'x'").run(), /append_only/);
    await assert.rejects(() => env.DB.prepare("DELETE FROM audit_log").run(), /append_only/);
    // El voto anulado deja de contar
    const res = await call("/api/admin/results", admin(cookie));
    const md = res.json.categories.find((c) => c.id === a.categoryId);
    assert.equal(md.nominees.reduce((s, n) => s + n.valid, 0), 0);
  });

  test("no se puede borrar una candidatura con votos", async () => {
    const a = await catAndNominees("merito-deportivo");
    await call("/api/vote/ballot", { method: "POST", body: { selections: { [a.categoryId]: a.nominees[0].id } } });
    const cookie = await adminLogin();
    const r = await call(`/api/admin/nominees/${a.nominees[0].id}`, { method: "DELETE", body: { reason: "Prueba de borrado" }, ...admin(cookie) });
    assert.equal(r.status, 409);
  });

  test("fechas en hora de Madrid se guardan en UTC (horario de invierno)", async () => {
    const cookie = await adminLogin();
    const r = await call("/api/admin/settings", {
      method: "PUT",
      body: { voting_opens_at_local: "2026-12-01T10:00", voting_closes_at_local: "2026-12-15T23:59", reason: "Calendario oficial" },
      ...admin(cookie),
    });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.equal(r.json.settings.voting_opens_at, "2026-12-01T09:00:00.000Z");
    assert.equal(r.json.settings.voting_closes_at_local, "2026-12-15T23:59");
  });

  test("exportación CSV protegida contra fórmulas", async () => {
    const cookie = await adminLogin();
    await env.DB.prepare("UPDATE nominees SET name = '=HYPERLINK(\"x\")' WHERE slug = 'alfredo-mena'").run();
    const r = await call("/api/admin/results.csv", admin(cookie));
    assert.equal(r.status, 200);
    assert.match(r.text, /"'=HYPERLINK/);
  });
});

describe("Web pública", () => {
  test("HTML renderizado en servidor con metadatos y cabeceras de seguridad", async () => {
    await setPhase("nominations");
    const r = await call("/categorias/carnaval-linense");
    assert.equal(r.status, 200);
    assert.match(r.text, /<h1[^>]*>Premio al Carnaval<\/h1>/);
    assert.match(r.text, /property="og:title"/);
    assert.match(r.text, /Los Desparasitaos/);
    assert.match(r.headers.get("Content-Security-Policy"), /frame-ancestors 'none'/);
    assert.equal((await call("/no-existe")).status, 404);
    assert.equal((await call("/admin")).headers.get("X-Robots-Tag"), "noindex, nofollow");
  });

  test("los textos con HTML se muestran como texto (sin inyección)", async () => {
    await setPhase("nominations");
    await env.DB.prepare("UPDATE nominees SET reason = '<script>alert(1)</script>' WHERE slug = 'alfredo-mena'").run();
    const r = await call("/nominados/alfredo-mena");
    assert.doesNotMatch(r.text, /<script>alert\(1\)<\/script>/);
  });
});
