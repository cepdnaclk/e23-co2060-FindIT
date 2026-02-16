import unittest
from matching import find_matches

# A "Mock" class to simulate your SQLAlchemy Item model
class MockItem:
    def __init__(self, id, description, category, item_type, full_name):
        self.id = id
        self.description = description
        self.category = category
        self.item_type = item_type
        # Simulating the relationship: item.reporter.full_name
        self.reporter = type('obj', (object,), {'full_name': full_name})

class TestMatchingLogic(unittest.TestCase):

    def setUp(self):
        """Set up a fake database of items for testing."""
        self.mock_db = [
            MockItem(1, "Black Dell Laptop", "Electronics", "Found", "Saman Perera"),
            MockItem(2, "Red Nike Water Bottle", "Accessories", "Found", "Nilmi Silva"),
            MockItem(3, "Silver iPhone 13", "Electronics", "Found", "Arjun Ratnayake"),
            MockItem(4, "Blue Umbrella", "Personal Items", "Lost", "Kamal Gunawardena")
        ]

    def print_results(self, test_name, results):
        """Helper to display what the AI found in the terminal."""
        print(f"\n--- {test_name} ---")
        if not results:
            print("Result: No matches found (Correct Filtering).")
        else:
            for match in results:
                print(f"Result: Found '{match['description']}' | Confidence: {match['confidence']}% | Reported By: {match['reported_by']}")

    def test_perfect_match(self):
        """Test if an exact description returns a high score."""
        results = find_matches("Black Dell Laptop", "Electronics", "Lost", self.get_mock_session())
        self.print_results("PERFECT MATCH TEST", results)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]['confidence'], 100)
        self.assertEqual(results[0]['reported_by'], "Saman Perera")

    def test_typo_and_case_insensitivity(self):
        """Test if it finds 'iphne' when looking for 'iPhone'."""
        results = find_matches("silver iphne 13", "Electronics", "Lost", self.get_mock_session())
        self.print_results("TYPO & CASE TEST", results)
        self.assertTrue(len(results) > 0)
        self.assertGreaterEqual(results[0]['confidence'], 70)

    def test_word_order_shuffle(self):
        """Test if 'Water Bottle Nike Red' matches 'Red Nike Water Bottle'."""
        results = find_matches("Water Bottle Nike Red", "Accessories", "Lost", self.get_mock_session())
        self.print_results("WORD ORDER TEST", results)
        self.assertTrue(len(results) > 0)
        self.assertGreaterEqual(results[0]['confidence'], 90)

    def test_category_filtering(self):
        """Test that it ignores items in different categories."""
        results = find_matches("Blue Umbrella", "Electronics", "Found", self.get_mock_session())
        self.print_results("CATEGORY FILTER TEST", results)
        self.assertEqual(len(results), 0)

    def get_mock_session(self):
        """A helper to simulate the db_session.query().filter().all() chain."""
        class MockQuery:
            def __init__(self, data): self.data = data
            def filter(self, *args): return self 
            def all(self): return self.data
        
        class MockSession:
            def __init__(self, data): self.data = data
            def query(self, model): return MockQuery(self.data)
            
        return MockSession(self.mock_db)

if __name__ == '__main__':
    # Run the tests
    unittest.main()