-- Prueba de la votación (25/11/2026, madrugada): se abre ya. La migración 0018 la devuelve a las 10:00 y borra las papeletas de prueba.
UPDATE settings SET value = '2026-11-25T02:00:00.000Z', updated_by = 'prueba' WHERE key = 'voting_opens_at';
