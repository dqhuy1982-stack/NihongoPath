"""Database contracts for the downloadable fixture, not a production migration."""
import json
import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class DatabaseContracts(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        with sqlite3.connect(ROOT / 'public/demo-data/nihongo-demo.sqlite') as source:
            source.backup(self.db)
        self.db.execute('PRAGMA foreign_keys = ON')

    def tearDown(self):
        self.db.close()

    def test_fixture_has_editorial_drafts_without_fabricated_review(self):
        self.assertEqual(self.db.execute('PRAGMA integrity_check').fetchone()[0], 'ok')
        self.assertEqual(self.db.execute('PRAGMA foreign_key_check').fetchall(), [])
        rows = self.db.execute('SELECT payload FROM content_drafts').fetchall()
        self.assertEqual(len(rows), 2)
        self.assertTrue(all(not json.loads(row[0])['review']['confirmed'] for row in rows))
        self.assertEqual(self.db.execute('SELECT count(*) FROM content_editor_events').fetchone()[0], 0)

    def test_published_definitions_and_recorded_answers_cannot_be_updated(self):
        for statement in [
            "UPDATE content SET level='N2' WHERE id='n5-introduction'",
            "UPDATE questions SET skill='fake' WHERE content_id='n5-introduction'",
            "DELETE FROM content_releases WHERE content_id='n5-introduction'",
            'UPDATE attempts SET correct=1 WHERE correct=0',
        ]:
            with self.assertRaisesRegex(sqlite3.IntegrityError, 'immutable'):
                self.db.execute(statement)

    def test_question_can_recur_in_v2_but_answers_cannot_cross_session_versions(self):
        content = list(self.db.execute("SELECT * FROM content WHERE id='n5-introduction'").fetchone())
        content[1] = 2
        payload = json.loads(content[5]); payload['version'] = 2; payload['definition']['version'] = 2
        content[5] = json.dumps(payload)
        self.db.execute('INSERT INTO content VALUES (?,?,?,?,?,?)', content)
        question = list(self.db.execute("SELECT * FROM questions WHERE content_id='n5-introduction' LIMIT 1").fetchone())
        question[2] = 2
        self.db.execute('INSERT INTO questions VALUES (?,?,?,?,?,?)', question)
        self.db.execute('INSERT INTO sessions VALUES (?,?,?,?,?,?)', ('version-one-session', 'demo-minh', 'n5-introduction', 1, 'paused', '{}'))
        valid = ('valid-version-one', 'demo-minh', question[0], question[3], 'n5-introduction', 'version-one-session', 1, 1, '2026-11-01T12:00:00+09:00', '{}')
        self.db.execute('INSERT INTO attempts VALUES (?,?,?,?,?,?,?,?,?,?)', valid)
        invalid = list(valid); invalid[0] = 'crossed-version'; invalid[6] = 2
        with self.assertRaisesRegex(sqlite3.IntegrityError, 'FOREIGN KEY'):
            self.db.execute('INSERT INTO attempts VALUES (?,?,?,?,?,?,?,?,?,?)', invalid)
        invalid_owner = list(valid); invalid_owner[0] = 'crossed-learner'; invalid_owner[1] = 'demo-quan'
        with self.assertRaisesRegex(sqlite3.IntegrityError, 'FOREIGN KEY'):
            self.db.execute('INSERT INTO attempts VALUES (?,?,?,?,?,?,?,?,?,?)', invalid_owner)
        self.assertEqual(self.db.execute("SELECT count(*) FROM questions WHERE id=?", (question[0],)).fetchone()[0], 2)


if __name__ == '__main__':
    unittest.main()
