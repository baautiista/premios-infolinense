-- Honor a la Trayectoria deja de mostrarse en la web (25/11/2026). No tenía votación ni candidaturas.
UPDATE categories SET published = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE slug = 'honor-a-la-trayectoria';
