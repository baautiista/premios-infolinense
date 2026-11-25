-- Fin de la prueba: la votación abre oficialmente hoy a las 10:00 (hora de Madrid) y se borran las papeletas de prueba.
UPDATE settings SET value = '2026-11-25T09:00:00.000Z', updated_by = 'organizacion' WHERE key = 'voting_opens_at';
DELETE FROM votes WHERE ballot_id IN (SELECT id FROM ballots WHERE created_at < '2026-11-25T09:00:00.000Z');
DELETE FROM ballots WHERE created_at < '2026-11-25T09:00:00.000Z';
DELETE FROM rate_limits;
