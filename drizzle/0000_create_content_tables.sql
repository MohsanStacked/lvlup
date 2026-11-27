CREATE TABLE enquiries (
  reference TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,
  body TEXT NOT NULL
);
--> statement-breakpoint

CREATE INDEX enquiries_received_at ON enquiries (received_at);
--> statement-breakpoint

CREATE TABLE media (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  body TEXT NOT NULL
);
