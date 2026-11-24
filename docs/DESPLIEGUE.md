# Despliegue en Cloudflare y conexión de premios.infolinense.com

Pasos para poner en marcha la plataforma por primera vez. Todo se hace una sola vez; después, cada despliegue es un botón en GitHub Actions.

> **Antes de empezar:** necesitas acceso a la cuenta de Cloudflare donde está el dominio `infolinense.com`, y Node.js 22 en tu ordenador.

## 1. Preparar el proyecto

```bash
git clone https://github.com/baautiista/premios-infolinense.git
cd premios-infolinense
npm install
npx wrangler login          # abre el navegador para autorizar Wrangler en tu cuenta de Cloudflare
```

## 2. Crear la base de datos (D1) y el almacén de fotos (R2)

```bash
npx wrangler d1 create premios-infolinense
```

Copia el `database_id` que aparece y pégalo en `wrangler.toml`, en lugar de `REEMPLAZAR_CON_EL_ID_DE_D1`.

```bash
npx wrangler r2 bucket create premios-infolinense-media
npx wrangler d1 migrations apply premios-infolinense --remote
```

La segunda orden crea las tablas y carga las categorías, las 46 candidaturas, las 2 alternativas y las páginas en borrador.

## 3. Turnstile (protección anti-bots, gratuito)

1. Panel de Cloudflare → **Turnstile** → **Add widget**.
2. Nombre: `Premios InfoLinense`. Dominio: `premios.infolinense.com`. Modo: **Managed**.
3. Copia la **Site Key** en `wrangler.toml` → `TURNSTILE_SITE_KEY`.
4. Guarda la **Secret Key** como secreto (paso 4).

## 4. Secretos

Ninguno se guarda en el código. Genera cadenas aleatorias largas, por ejemplo con `openssl rand -base64 48`:

```bash
npx wrangler secret put TURNSTILE_SECRET   # la Secret Key de Turnstile
npx wrangler secret put VOTE_PEPPER        # cadena aleatoria: cifra las huellas de los votantes
npx wrangler secret put SESSION_SECRET     # otra cadena aleatoria distinta: firma los identificadores
```

> **No cambies `VOTE_PEPPER` ni `SESSION_SECRET` durante la votación.** Si los cambias, el sistema deja de reconocer a quien ya votó. Guárdalos en un gestor de contraseñas.

Mientras falte alguno, la web funciona pero la votación muestra «estará disponible en breve» y el panel avisa de qué falta. No finge estar operativa.

## 5. Primer despliegue y dominio

```bash
npm run deploy
```

`wrangler.toml` declara `premios.infolinense.com` como **Custom Domain**: si `infolinense.com` está en la misma cuenta de Cloudflare, Wrangler crea el registro DNS y el certificado HTTPS automáticamente. Comprueba después en **Workers & Pages → premios-infolinense → Settings → Domains & Routes** que aparece como activo.

Si el dominio no está en Cloudflare: añade `infolinense.com` a Cloudflare (plan gratuito) y cambia los servidores de nombres en tu registrador, o crea un subdominio delegado. Hasta entonces la web está disponible en la dirección `*.workers.dev` que muestra Wrangler (Turnstile rechazará los votos en esa dirección porque está configurado para el dominio oficial).

## 6. Usuarios del panel

```bash
node scripts/create-admin.mjs tu-correo@infolinense.com "Tu nombre" admin
```

Pide la contraseña por teclado (mínimo 12 caracteres), no la guarda y genera la orden para insertarla en D1. Perfiles:

- **admin**: todo, incluidos resultados, revisión de votos, fases y ganadores.
- **editor**: categorías, candidaturas, fotos, patrocinadores y páginas. No ve recuentos.

**Recomendado:** añade una segunda capa con **Cloudflare Access** (Zero Trust, gratuito hasta 50 usuarios): Zero Trust → Access → Applications → Self-hosted → `premios.infolinense.com/admin*` y `premios.infolinense.com/api/admin*`, con una política que permita solo vuestros correos.

## 7. Despliegues posteriores desde GitHub

En el repositorio: **Settings → Secrets and variables → Actions**, añade:

- `CLOUDFLARE_API_TOKEN`: token con la plantilla «Edit Cloudflare Workers» y permiso de edición de D1.
- `CLOUDFLARE_ACCOUNT_ID`: el identificador de tu cuenta.

Después: **Actions → Desplegar en Cloudflare → Run workflow**. El flujo compila, ejecuta las pruebas, registra un punto de restauración de la base de datos, aplica las migraciones y despliega. Cada Pull Request ejecuta automáticamente el flujo **CI** (tipos, build, pruebas y validación con Wrangler).

## 8. Copias de seguridad y recuperación

- **Automática:** D1 Time Travel permite restaurar la base de datos a cualquier minuto de los últimos **7 días (plan gratuito)** o **30 días (Workers Paid)**.
  ```bash
  npx wrangler d1 time-travel info premios-infolinense                  # punto actual
  npx wrangler d1 time-travel restore premios-infolinense --timestamp=2026-12-10T21:00:00Z
  ```
- **Manual:** `npm run backup` guarda una exportación SQL completa en `backups/` (fuera de Git). Hazla al cerrar la votación y antes de publicar ganadores.
- **Fotografías:** R2 conserva cada archivo con un nombre único; las fotos sustituidas no se borran.

## 9. Capacidad y costes

Todo funciona en los planes gratuitos de Cloudflare. Límites a tener en cuenta durante la votación:

| Recurso | Gratuito | Workers Paid (5 $/mes) |
|---|---|---|
| Escrituras D1 | 100.000 filas/día | 50 millones/mes incluidas |
| Peticiones al Worker | 100.000/día | 10 millones/mes incluidas |
| Recuperación (Time Travel) | 7 días | 30 días |

Cada papeleta escribe unas 12–15 filas, así que el plan gratuito admite del orden de **6.000–7.000 papeletas al día**. Si se esperan más, o para tener 30 días de recuperación, conviene activar Workers Paid durante la votación. **Esta decisión es tuya: el proyecto no contrata nada.**

## 10. Calendario: qué hacer en cada fase

En **/admin → Fases y fechas** (horario peninsular):

1. **Próximamente**: fija la fecha de presentación para mostrar la cuenta atrás.
2. **Nominaciones publicadas**: se activa sola al llegar la fecha de presentación, o manualmente.
3. **Votaciones abiertas**: fija apertura y cierre. La web abre y cierra la votación a su hora.
4. **Votaciones cerradas**: automático al llegar el cierre. Revisa las papeletas «En revisión» y las incidencias.
5. **Ganadores publicados**: elige los ganadores en **Ganadores**, fija la fecha de publicación y pasa a esta fase. Hasta la fecha fijada, nada es público.

Tras el periodo de reclamaciones, **Incidencias → Eliminar huellas técnicas** borra las huellas de red y navegador (los votos y la auditoría se conservan).
