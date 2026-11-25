-- Se restauran las referencias a la FLAVI (25/11/2026).
UPDATE categories SET nomination_note = 'Cuatro candidaturas propuestas por la FLAVI.', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE slug = 'accion-de-barrio';

UPDATE pages SET body = REPLACE(body,
  'sus actividades y los méritos destacados durante 2026.',
  'sus actividades y los méritos destacados durante 2026.' || char(10) || char(10) || 'La categoría Acción de Barrio cuenta con cuatro candidaturas propuestas por la Federación Local de Asociaciones de Vecinos Inmaculada (FLAVI).'),
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE slug = 'bases' AND body NOT LIKE '%FLAVI%';

UPDATE pages SET body = REPLACE(body,
  'La selección de nominados parte de las propuestas de los vecinos y del trabajo editorial del medio.',
  'La selección de nominados parte de las propuestas de los vecinos y del trabajo editorial del medio.' || char(10) || char(10) || 'La categoría Acción de Barrio cuenta con la participación de la FLAVI, responsable de proponer sus cuatro candidaturas.'),
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE slug = 'organizacion' AND body NOT LIKE '%FLAVI%';
