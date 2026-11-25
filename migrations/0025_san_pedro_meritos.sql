-- San Pedro: dos méritos más de 2026 (25/11/2026).
UPDATE nominees SET merits = merits || char(10) ||
  'Celebración de las fiestas del barrio de San Pedro, con la participación de la asociación Avanvida, invitada nuevamente por la entidad vecinal (27 de junio).' || char(10) ||
  'Incorporación de los Campanilleros del Junquillo al centro vecinal de la calle Santa Ana, número 14 (septiembre).',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE slug = 'asociacion-de-vecinos-san-pedro' AND merits NOT LIKE '%Campanilleros%';
