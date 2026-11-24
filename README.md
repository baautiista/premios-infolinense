# Premios InfoLinense

Plataforma oficial de los Premios InfoLinense — **premios.infolinense.com**.
Candidaturas, votación popular, panel de administración y presentación digital de ganadores.

## Tecnología

| Pieza | Elección | Motivo |
|---|---|---|
| Servidor | Cloudflare Workers | Mismo proveedor que el dominio; sin servidores que mantener |
| Base de datos | Cloudflare D1 (SQLite) | Transacciones y restricciones para impedir votos duplicados; recuperación Time Travel |
| Fotografías | Cloudflare R2 | Sin costes de salida; nombres únicos con caché permanente |
| Anti-bots | Cloudflare Turnstile | Gratuito, sin rompecabezas molestos |
| Interfaz | React 19 + TypeScript + Tailwind CSS 4 | Renderizado en el servidor (SEO y vista previa en redes) e hidratación en el navegador |
| Build | esbuild + Tailwind | Un único script (`scripts/build.mjs`), sin dependencias pesadas |

Las páginas públicas se generan en el servidor: los buscadores y las vistas previas de Instagram y WhatsApp reciben el contenido y los metadatos Open Graph completos. El panel (`/admin`) se descarga aparte y no pesa en la web pública.

## Estructura

```
migrations/          Esquema D1 y datos iniciales (categorías, candidaturas, páginas)
src/shared/          Fases, fechas en Europe/Madrid, tipos y formato de páginas
src/worker/          API, votación, panel, imágenes y renderizado en servidor
src/app/             Web pública (React): portada, categorías, candidaturas, papeleta, ganadores
src/admin/           Panel de administración
src/client/          Entrada del navegador y sistema de diseño (styles.css)
public/              Logotipo oficial, tipografías (OFL), iconos, imagen para redes
scripts/             Build, servidor local, alta de administradores, copias de seguridad
tests/               Pruebas de votación y seguridad
docs/                Despliegue, seguridad e identidad visual
```

## Desarrollo local

```bash
npm install
npm run dev          # http://localhost:8787 · panel en /admin (admin@premios.local / premios-local-2026)
npm test             # 35 pruebas de votación, seguridad y fases
```

El servidor local ejecuta el Worker compilado con D1 y R2 emulados (`scripts/local-runtime.mjs`). Para probar una fase concreta: `node scripts/dev-server.mjs --phase=voting`.

## Documentación

- [Despliegue y conexión del dominio](docs/DESPLIEGUE.md)
- [Seguridad y privacidad de la votación](docs/SEGURIDAD.md)
- [Identidad visual y sistema de diseño](docs/IDENTIDAD.md)
