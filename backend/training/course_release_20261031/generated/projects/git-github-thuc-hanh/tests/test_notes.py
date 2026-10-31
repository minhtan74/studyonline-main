import unittest
from pathlib import Path
from tools.check_notes import check_notes

class NotesTest(unittest.TestCase):
    def test_notes_have_required_content(self):
        self.assertTrue(list(Path('notes').glob('*.md')), 'Need at least one note')
        self.assertEqual(check_notes('notes'), [])

if __name__ == '__main__':
    unittest.main()
