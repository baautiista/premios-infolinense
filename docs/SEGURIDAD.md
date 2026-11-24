# Seguridad y privacidad de la votación

## Principios

- **Sin datos personales para votar.** No se piden nombre, correo ni teléfono (decisión de la organización: sin confirmación por correo).
- **Validación siempre en el servidor.** El navegador no decide nada: el Worker comprueba fase, candidatura, categoría y duplicados.
- **Resultados confidenciales.** Ningún endpoint público devuelve recuentos; solo el perfil «admin» del panel los ve.
- **Transparencia sobre los límites.** Sin registro, ningún sistema garantiza una persona = un voto. Las medidas lo dificultan, lo detectan y permiten corregirlo con un procedimiento auditado.

## Capas de protección

| Riesgo | Medida | Dónde |
|---|---|---|
| Bots y scripts | Cloudflare Turnstile en cada papeleta, con acción y dominio verificados en el servidor | `src/worker/security.ts` |
| Repetir desde el mismo dispositivo | Identificador aleatorio firmado (HMAC), en cookie `HttpOnly` **y** en el almacenamiento local: hay que borrar ambos | `src/worker/vote.ts` |
| Borrar todo y repetir desde el mismo navegador y red | Huella «red + navegador» de las últimas 24 h → la papeleta queda **en revisión** (no cuenta hasta validarse) | `vote.ts` |
| Muchas papeletas desde una conexión | A partir de N al día (ajustable, 4 por defecto) → en revisión; a partir de M (40 por defecto) → rechazo. La IP nunca se usa como prueba única | `vote.ts`, panel |
| Envíos simultáneos | Restricción `UNIQUE(edition_id, device_hash)` y escritura en una transacción (D1 `batch`) | migración 0001 |
| Manipular la papeleta (otra categoría, alternativas, Honor, tipos) | Validación contra las candidaturas publicadas + disparador SQL que rechaza votos incoherentes; los votos no se pueden modificar | `vote.ts`, migración |
| Fuerza bruta | Límite de 30 envíos cada 10 min por conexión; 5 intentos de acceso al panel cada 15 min por cuenta | `rateLimit()` |
| Acceso indebido al panel | Contraseñas PBKDF2-SHA256 (100.000 iteraciones), sesiones de 12 h en cookie `HttpOnly; Secure; SameSite=Strict`, cabecera anti-CSRF y comprobación de origen, perfiles admin/editor | `src/worker/admin.ts` |
| Alterar el registro | `audit_log` solo admite inserciones (disparadores impiden `UPDATE` y `DELETE`) | migración 0001 |
| Inyección de código | React escapa todo el contenido; las páginas editables usan un formato propio sin HTML; JSON incrustado escapado; CSP estricta (`script-src 'self'` + Turnstile) | `render.tsx`, `http.ts` |
| Subida de archivos maliciosos | Solo JPEG/PNG/WebP comprobados por firma binaria, máx. 6 MB, nombres aleatorios, servidos con `nosniff` y CSP propia | `src/worker/media.ts` |
| Fórmulas en el CSV | Celdas que empiezan por `= + - @` se neutralizan | `admin.ts` |

## Datos que se guardan por papeleta

- `device_hash`, `net_hash`, `signal_hash`: HMAC-SHA256 con el secreto `VOTE_PEPPER`. No permiten recuperar la IP ni el identificador sin el secreto.
- Las selecciones, la fecha y el estado (válida, en revisión o anulada).
- `receipt_hash`: hash del código de comprobante que recibe la persona.

No se guarda la IP en claro ni el agente de usuario. La red IPv6 se agrupa por su prefijo /64.

Tras publicar resultados y cerrar el periodo de reclamaciones, **Incidencias → Eliminar huellas técnicas** borra `net_hash`, `signal_hash` y el registro de incidencias.

## Procedimiento de anulación

1. **Revisión de votos** muestra las papeletas en revisión agrupadas por conexión, con el motivo automático y las selecciones.
2. Cada acción (validar, anular o restaurar) exige escribir un **motivo**. Queda registrada con responsable, fecha, estado anterior y nuevo.
3. Las papeletas anuladas dejan de contar al instante. La persona votante puede comprobar con su código si su papeleta está «registrada» o «anulada».

## Pruebas

`npm test` ejecuta 35 pruebas sobre el Worker real y una base de datos con el mismo esquema que D1: duplicados (cookie, almacenamiento local, mismo navegador, red compartida, envíos simultáneos), manipulaciones (categoría cruzada, alternativas, Honor, tipos, tamaño), Turnstile, fases y fechas, confidencialidad de resultados, CSRF, auditoría y exportación CSV.

## Pendiente de decisión de la organización

- Criterio de desempate (aparece marcado como pendiente en las Bases).
- Base jurídica y plazo de conservación de las huellas técnicas (Política de privacidad).
- Si se desea una verificación más fuerte, se puede añadir un acceso opcional con Google o un código por SMS. Ambas opciones exigen tratar datos personales y, en el caso del SMS, tienen coste.
