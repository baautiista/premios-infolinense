// Crea (o actualiza) un usuario del panel sin guardar la contraseña en ningún sitio.
// Uso: node scripts/create-admin.mjs correo@infolinense.com "Nombre" admin|editor
// Pide la contraseña por teclado y genera la orden de Wrangler para insertar el usuario en D1.
import { webcrypto } from "node:crypto";
import { createInterface } from "node:readline";
import { writeFileSync } from "node:fs";

const [email, name, role = "editor"] = process.argv.slice(2);
if (!email || !name || !["admin", "editor"].includes(role)) {
  console.error('Uso: node scripts/create-admin.mjs correo "Nombre" admin|editor');
  process.exit(1);
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => rl.output.write(s.includes(question) ? s : "");
    rl.question(question, (a) => {
      rl.close();
      process.stdout.write("\n");
      resolve(a);
    });
  });
}

const password = process.env.ADMIN_PASSWORD ?? (await ask("Contraseña (mínimo 12 caracteres): "));
if (password.length < 12) {
  console.error("La contraseña debe tener al menos 12 caracteres.");
  process.exit(1);
}
const salt = Buffer.from(webcrypto.getRandomValues(new Uint8Array(16))).toString("base64");
const key = await webcrypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
const bits = await webcrypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: Buffer.from(salt, "base64"), iterations: 100000 }, key, 256);
const hash = Buffer.from(bits).toString("hex");
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const sql = `INSERT INTO admin_users (email, name, role, password_hash, password_salt, iterations) VALUES (${q(email.toLowerCase())}, ${q(name)}, ${q(role)}, ${q(hash)}, ${q(salt)}, 100000)
ON CONFLICT(email) DO UPDATE SET name = excluded.name, role = excluded.role, password_hash = excluded.password_hash, password_salt = excluded.password_salt, iterations = excluded.iterations, active = 1;
DELETE FROM admin_sessions WHERE user_id = (SELECT id FROM admin_users WHERE email = ${q(email.toLowerCase())});
`;
const file = ".admin-user.sql";
writeFileSync(file, sql, { mode: 0o600 });
console.log(`\nArchivo ${file} generado (contiene solo el hash, no la contraseña). Ejecuta:\n`);
console.log(`  npx wrangler d1 execute premios-infolinense --remote --file=${file} && rm ${file}\n`);
