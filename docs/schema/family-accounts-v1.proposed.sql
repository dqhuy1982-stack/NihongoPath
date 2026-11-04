-- NIHONGO PATH: FAMILY IDENTITY SCHEMA PROPOSAL (NOT AN APPLIED MIGRATION)
-- Read-only design/test fixture. Not referenced by wrangler migrations_dir.
-- Existing owner-scoped learners and progress remain untouched.
-- This SQL must be reviewed and integrated into Drizzle/schema migrations
-- together with server authorization before remote D1 apply.
PRAGMA foreign_keys = ON;

CREATE TABLE family_accounts (
  account_id TEXT PRIMARY KEY NOT NULL,
  identity_provider TEXT NOT NULL
    CHECK (identity_provider = 'cloudflare-access'),
  verified_subject TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (identity_provider, verified_subject)
);

CREATE TABLE families (
  family_id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL
    CHECK (length(trim(display_name)) BETWEEN 1 AND 80),
  created_by_account TEXT NOT NULL REFERENCES family_accounts(account_id)
    ON DELETE RESTRICT,
  created_at TEXT NOT NULL
);

CREATE TABLE family_memberships (
  family_id TEXT NOT NULL REFERENCES families(family_id)
    ON DELETE RESTRICT,
  account_id TEXT NOT NULL REFERENCES family_accounts(account_id)
    ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('manager','learner')),
  joined_at TEXT NOT NULL,
  PRIMARY KEY (family_id, account_id)
);

CREATE TABLE family_learner_links (
  family_id TEXT NOT NULL REFERENCES families(family_id)
    ON DELETE RESTRICT,
  learner_owner TEXT NOT NULL,
  learner_id TEXT NOT NULL,
  linked_at TEXT NOT NULL,
  PRIMARY KEY (family_id, learner_owner, learner_id),
  UNIQUE (learner_owner, learner_id),
  FOREIGN KEY (learner_owner, learner_id)
    REFERENCES learners(owner, id) ON DELETE RESTRICT
);

CREATE INDEX family_memberships_by_account
  ON family_memberships(account_id, family_id);
CREATE INDEX family_learner_links_by_owner
  ON family_learner_links(learner_owner, learner_id);
