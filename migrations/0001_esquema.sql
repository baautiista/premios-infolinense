-- Premios InfoLinense — esquema inicial (Cloudflare D1 / SQLite)
-- Fechas en ISO 8601 UTC. La conversión a Europe/Madrid se hace en la aplicación.

PRAGMA foreign_keys = ON;

CREATE TABLE editions (
  id          INTEGER PRIMARY KEY,
  year        INTEGER NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Configuración editable desde el panel (fase, fechas, límites, textos).
CREATE TABLE settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_by  TEXT
);

CREATE TABLE categories (
  id                 INTEGER PRIMARY KEY,
  edition_id         INTEGER NOT NULL REFERENCES editions(id),
  slug               TEXT NOT NULL,
  name               TEXT NOT NULL,
  award_title        TEXT,           -- p. ej. «Deportista del año»
  question           TEXT,           -- pregunta de la campaña
  description        TEXT,           -- presentación ampliada (opcional)
  nomination_note    TEXT,           -- p. ej. «Cuatro candidaturas propuestas por la FLAVI»
  color              TEXT NOT NULL,  -- color identificativo (hex)
  ink                TEXT NOT NULL DEFAULT '#FFFFFF', -- color del texto sobre la etiqueta
  slots              INTEGER NOT NULL DEFAULT 5 CHECK (slots BETWEEN 0 AND 20),
  votable            INTEGER NOT NULL DEFAULT 1 CHECK (votable IN (0,1)),
  published          INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0,1)),
  position           INTEGER NOT NULL DEFAULT 0,
  winner_nominee_id  INTEGER REFERENCES nominees(id) ON DELETE SET NULL,
  winner_reason      TEXT,           -- motivo público del reconocimiento
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (edition_id, slug)
);

CREATE TABLE nominees (
  id              INTEGER PRIMARY KEY,
  category_id     INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  subtitle        TEXT,
  reason          TEXT,   -- motivo breve de la nominación
  bio             TEXT,   -- presentación ampliada
  merits          TEXT,   -- méritos de 2026, uno por línea
  links           TEXT,   -- enlaces, uno por línea: «Texto | https://…»
  photo_portrait  TEXT,   -- 4:5
  photo_square    TEXT,   -- 1:1
  photo_wide      TEXT,   -- 1,91:1 (Open Graph)
  photo_alt       TEXT,
  photo_credit    TEXT,
  published       INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0,1)),
  is_alternate    INTEGER NOT NULL DEFAULT 0 CHECK (is_alternate IN (0,1)),
  position        INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX nominees_category_idx ON nominees (category_id, position);

-- Papeletas. Sin datos personales directos: solo identificadores seudonimizados (HMAC con secreto).
CREATE TABLE ballots (
  id             INTEGER PRIMARY KEY,
  edition_id     INTEGER NOT NULL REFERENCES editions(id),
  device_hash    TEXT NOT NULL,
  net_hash       TEXT,            -- conexión (IPv4 o prefijo /64 de IPv6)
  signal_hash    TEXT,            -- conexión + navegador
  receipt_hash   TEXT NOT NULL UNIQUE,
  status         TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid','review','annulled')),
  flags          TEXT,            -- motivos de revisión automática, separados por comas
  local_day      TEXT NOT NULL,   -- día en Europe/Madrid (YYYY-MM-DD)
  created_at     TEXT NOT NULL,
  reviewed_at    TEXT,
  reviewed_by    TEXT,
  review_reason  TEXT,
  UNIQUE (edition_id, device_hash)
);
CREATE INDEX ballots_net_idx ON ballots (edition_id, net_hash, local_day);
CREATE INDEX ballots_signal_idx ON ballots (edition_id, signal_hash, created_at);
CREATE INDEX ballots_status_idx ON ballots (edition_id, status);

CREATE TABLE votes (
  ballot_id    INTEGER NOT NULL REFERENCES ballots(id) ON DELETE CASCADE,
  category_id  INTEGER NOT NULL REFERENCES categories(id),
  nominee_id   INTEGER NOT NULL REFERENCES nominees(id),
  PRIMARY KEY (ballot_id, category_id)
);
CREATE INDEX votes_nominee_idx ON votes (category_id, nominee_id);

-- Defensa en profundidad: un voto solo puede ir a una candidatura de esa misma categoría.
CREATE TRIGGER votes_category_consistency
BEFORE INSERT ON votes
WHEN (SELECT category_id FROM nominees WHERE id = NEW.nominee_id) IS NOT NEW.category_id
BEGIN
  SELECT RAISE(ABORT, 'vote_category_mismatch');
END;

-- Los votos no se modifican: las correcciones se hacen anulando la papeleta completa.
CREATE TRIGGER votes_no_update BEFORE UPDATE ON votes
BEGIN
  SELECT RAISE(ABORT, 'votes_are_immutable');
END;

CREATE TABLE rate_limits (
  key           TEXT PRIMARY KEY,
  window_start  INTEGER NOT NULL,
  count         INTEGER NOT NULL
);

-- Incidencias de seguridad para auditoría.
CREATE TABLE security_events (
  id           INTEGER PRIMARY KEY,
  type         TEXT NOT NULL,
  severity     TEXT NOT NULL CHECK (severity IN ('info','warning','high')),
  net_hash     TEXT,
  device_hash  TEXT,
  detail       TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX security_events_idx ON security_events (created_at);

CREATE TABLE admin_users (
  id               INTEGER PRIMARY KEY,
  email            TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name             TEXT NOT NULL,
  role             TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin','editor')),
  password_hash    TEXT NOT NULL,
  password_salt    TEXT NOT NULL,
  iterations       INTEGER NOT NULL,
  active           INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_login_at    TEXT
);

CREATE TABLE admin_sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL
);

-- Registro de intervenciones administrativas: solo se añaden filas, nunca se modifican ni borran.
CREATE TABLE audit_log (
  id           INTEGER PRIMARY KEY,
  actor        TEXT NOT NULL,
  action       TEXT NOT NULL,
  entity       TEXT,
  entity_id    TEXT,
  reason       TEXT,
  before_json  TEXT,
  after_json   TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TRIGGER audit_log_no_update BEFORE UPDATE ON audit_log
BEGIN
  SELECT RAISE(ABORT, 'audit_log_is_append_only');
END;
CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON audit_log
BEGIN
  SELECT RAISE(ABORT, 'audit_log_is_append_only');
END;

CREATE TABLE sponsors (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  logo_url    TEXT,
  url         TEXT,
  tier        TEXT,          -- tipo de colaboración
  position    INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0,1)),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Páginas informativas (bases, privacidad…). status = draft muestra el aviso «pendiente de aprobación».
CREATE TABLE pages (
  slug        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  summary     TEXT,
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
  position    INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_by  TEXT
);
