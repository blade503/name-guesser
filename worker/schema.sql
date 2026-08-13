CREATE TABLE IF NOT EXISTS predictions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  author     TEXT    NOT NULL,
  first_name TEXT    NOT NULL,
  weight_g   INTEGER NOT NULL,
  height_cm  REAL    NOT NULL,
  message    TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions (created_at DESC);

-- Une seule ligne possible : le résultat est unique (CHECK id = 1).
CREATE TABLE IF NOT EXISTS result (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  first_name TEXT    NOT NULL,
  weight_g   INTEGER NOT NULL,
  height_cm  REAL    NOT NULL,
  born_at    TEXT    NOT NULL,
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
