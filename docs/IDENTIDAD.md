# Identidad visual y sistema de diseño

La web reproduce el sistema gráfico de las publicaciones oficiales de los Premios InfoLinense 2026. Todo está centralizado en `src/client/styles.css` (tokens de Tailwind) y en los componentes de `src/app/components/brand.tsx`.

## Elementos

| Elemento | Valor | Origen |
|---|---|---|
| Logotipo | `public/brand/logo-premios-infolinense.{png,webp}` | Archivo original facilitado (sin redibujar) |
| Fondo | Degradado `#154DD5` (arriba a la derecha) → `#1038AC` → `#0C2A89` → `#081D61` (abajo a la izquierda) | Medido en el fondo oficial |
| Curva | Trazo blanco al 12 % (`BrandCurve`, `CURVE_PATH`) | Trazada sobre el fondo oficial |
| Titulares | Raleway ExtraBold (800), interletrado −0,035 em | Publicaciones |
| Textos | Raleway Medium (500) | Publicaciones |
| Etiquetas | Poppins Bold, mayúsculas, esquinas redondeadas | Publicaciones |
| Resalte | Verde lima `#C8F031` para «La Línea.» | **Aproximado**: la primera imagen con el lema no llegó; ajustar en `--color-lime` |
| Azul eléctrico / noche | `#1F5EFF` / `#061E5C` | Brief |

Las tipografías se sirven desde la propia web (licencia SIL OFL), sin Google Fonts.

## Colores por categoría

Se usan como acento (etiquetas, selección en la papeleta, indicadores), nunca como fondo de página. Editables desde el panel.

| Categoría | Color | Texto | Origen |
|---|---|---|---|
| Mérito Deportivo | `#00AA4F` | blanco | Publicación |
| Talento Emprendedor | `#081A54` | blanco | Publicación |
| Comercio a Pie de Calle | `#FE8E1A` | blanco | Publicación |
| Arte con Firma | `#E72E79` | blanco | Publicación |
| Creación en Red | `#62DBD1` | azul noche | Publicación |
| Vocación Educativa | `#00AA4F` | blanco | Publicación |
| Vida Asociativa | `#2756CD` | blanco | Publicación |
| Carnaval Linense | `#3A86FF` | blanco | Publicación |
| Vocación Cofrade | `#080B8F` | blanco | Publicación «Cofrade Linense» |
| Impulso Cofrade | `#A9C4FF` | `#080B8F` | Azul claro para diferenciarla de Vocación Cofrade (categorías independientes) |
| Acción de Barrio | `#FFB627` | azul noche | Variante propuesta (sin publicación) |
| Honor a la Trayectoria | `#D9E2F2` | azul noche | Variante plateada propuesta |

Los títulos de premio («Deportista del año»…) y las preguntas de cada categoría están copiados de las publicaciones.

## Componentes reutilizables

- `Logo`, `BrandCurve`: marca.
- `CategoryTag`: etiqueta de categoría en 4 tamaños.
- `Portrait`: retrato 4:5; sin fotografía muestra las iniciales (no se inventan imágenes).
- `NomineeCard`, `CategoryList`: tarjeta de candidatura y lista editorial de categorías.
- Botones: `btn` + `btn-primary` (blanco), `btn-lime` (votar) o `btn-ghost`.

## Accesibilidad

Objetivo WCAG 2.2 AA: navegación por teclado, foco visible en lima, enlace «Saltar al contenido», papeleta con `fieldset` y `radio` nativos, avisos con `aria-live`, y animaciones desactivadas con «reducir movimiento».

**Contraste a vigilar:** el texto blanco sobre el naranja de Comercio (`#FE8E1A`) no alcanza el mínimo de 3:1 ni siquiera en tamaño grande. Se mantiene en las etiquetas para respetar la identidad; si se prefiere priorizar la accesibilidad, cambia el color del texto de esa categoría a azul noche en el panel.
