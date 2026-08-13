CREATE TABLE IF NOT EXISTS predictions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  author     TEXT    NOT NULL,
  first_name TEXT    NOT NULL,
  birth_date TEXT    NOT NULL,
  weight_g   INTEGER NOT NULL,
  height_cm  REAL    NOT NULL,
  message    TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions (created_at DESC);

-- Une seule ligne possible : le résultat est unique (CHECK id = 1).
-- Colonnes nullables : les parents peuvent sceller le prénom des mois avant
-- de connaître le poids et la taille. Rien ne sort de l'API tant que
-- published = 0, y compris le prénom.
CREATE TABLE IF NOT EXISTS result (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  first_name TEXT,
  weight_g   INTEGER,
  height_cm  REAL,
  born_at    TEXT,
  published  INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
