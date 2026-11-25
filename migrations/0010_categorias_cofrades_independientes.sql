-- Vocación Cofrade e Impulso Cofrade: dos categorías independientes (25/11/2026).
-- Solo cambia textos y color; no toca votos, papeletas ni el resto de categorías.

UPDATE categories SET
  award_title = 'Premio a la Vocación Cofrade',
  question = '¿Qué persona o trayectoria del mundo cofrade de La Línea merece este premio?',
  description = 'Reconoce a las personas que dedican su trayectoria a mantener viva y engrandecer la Semana Santa linense.',
  nomination_note = 'Premio cofrade 1 de 2 · Personas y trayectorias. Categoría independiente, con su propio voto, su propio ganador y su propio trofeo.',
  color = '#080B8F', ink = '#FFFFFF',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE slug = 'vocacion-cofrade';

UPDATE categories SET
  award_title = 'Premio al Impulso Cofrade',
  question = '¿Qué proyecto, iniciativa o entidad cofrade de La Línea merece este premio?',
  description = 'Reconoce proyectos e iniciativas que conservan, enriquecen y divulgan el patrimonio y la cultura cofrade de La Línea.',
  nomination_note = 'Premio cofrade 2 de 2 · Proyectos e iniciativas. Categoría independiente, con su propio voto, su propio ganador y su propio trofeo.',
  color = '#A9C4FF', ink = '#080B8F',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE slug = 'impulso-cofrade';

-- Cada candidatura en su categoría. Solo se mueve si estuviera mal y no tiene votos.
UPDATE nominees SET category_id = (SELECT id FROM categories WHERE slug = 'vocacion-cofrade')
WHERE slug IN ('ernesto-frigolet-y-pepe-guzman', 'antonia-gil', 'josema-sanchez-bautista')
  AND category_id IS NOT (SELECT id FROM categories WHERE slug = 'vocacion-cofrade')
  AND NOT EXISTS (SELECT 1 FROM votes v WHERE v.nominee_id = nominees.id);

UPDATE nominees SET category_id = (SELECT id FROM categories WHERE slug = 'impulso-cofrade')
WHERE slug IN ('tertulia-cofrade-el-punal', 'sila-restauracion', 'cinema-cofrade')
  AND category_id IS NOT (SELECT id FROM categories WHERE slug = 'impulso-cofrade')
  AND NOT EXISTS (SELECT 1 FROM votes v WHERE v.nominee_id = nominees.id);
