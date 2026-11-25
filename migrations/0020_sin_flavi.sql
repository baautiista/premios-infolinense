-- Se retira toda referencia a la FLAVI (25/11/2026).
UPDATE categories SET nomination_note = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE nomination_note LIKE '%FLAVI%';

UPDATE pages SET body = REPLACE(REPLACE(body,
  char(10) || char(10) || 'La categoría Acción de Barrio cuenta con cuatro candidaturas propuestas por la Federación Local de Asociaciones de Vecinos Inmaculada (FLAVI).', ''),
  'La categoría Acción de Barrio cuenta con cuatro candidaturas propuestas por la Federación Local de Asociaciones de Vecinos Inmaculada (FLAVI).', ''),
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE slug = 'bases';

UPDATE pages SET body = REPLACE(REPLACE(body,
  char(10) || char(10) || 'La categoría Acción de Barrio cuenta con la participación de la FLAVI, responsable de proponer sus cuatro candidaturas.', ''),
  'La categoría Acción de Barrio cuenta con la participación de la FLAVI, responsable de proponer sus cuatro candidaturas.', ''),
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE slug = 'organizacion';

-- Por si quedara en cualquier otro texto publicado.
UPDATE pages SET body = REPLACE(REPLACE(body, ' Las de la categoría Acción de Barrio son propuestas por la FLAVI.', ''), 'Las de la categoría Acción de Barrio son propuestas por la FLAVI.', '') WHERE body LIKE '%FLAVI%';
