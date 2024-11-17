import unittest
from effective_feature_state_store import EffectiveFeatureStateStore

class TestEffectiveFeatureStateStore(unittest.TestCase):
    def setUp(self):
        self.store = EffectiveFeatureStateStore(audiences=['audience1'], initial_values=[
            {'feature_key': 'feature1', 'value': 'value1'},
            {'feature_key': 'feature2', 'value': 'value2'}
        ])

    def test_get(self):
        self.assertEqual(self.store.get('feature1'), 'value1')
        self.assertEqual(self.store.get('feature2'), 'value2')
        self.assertIsNone(self.store.get('feature3'))

    def test_set(self):
        self.store.set('feature3', 'value3')
        self.assertEqual(self.store.get('feature3'), 'value3')

    def test_all(self):
        all_values = self.store.all()
        self.assertEqual(all_values['feature1'], 'value1')
        self.assertEqual(all_values['feature2'], 'value2')

    def test_on_off(self):
        callback = unittest.mock.MagicMock()
        self.store.on('feature-updated', callback)
        self.store.set('feature1', 'new_value1')
        callback.assert_called_with('feature1', 'new_value1')
        self.store.off('feature-updated', callback)
        self.store.set('feature1', 'new_value2')
        callback.assert_called_once()

    def test_audiences(self):
        self.assertEqual(self.store.audiences, ['audience1'])
        self.store.audiences = ['audience2']
        self.assertEqual(self.store.audiences, ['audience2'])

    def test_get_error_handling(self):
        with self.assertRaises(Exception):
            self.store.get(None)

    def test_set_error_handling(self):
        with self.assertRaises(Exception):
            self.store.set(None, 'value')

    def test_all_error_handling(self):
        with self.assertRaises(Exception):
            self.store.all(None)

    def test_on_off_error_handling(self):
        callback = unittest.mock.MagicMock()
        with self.assertRaises(Exception):
            self.store.on(None, callback)
        with self.assertRaises(Exception):
            self.store.off(None, callback)

    def test_audiences_error_handling(self):
        with self.assertRaises(Exception):
            self.store.audiences = None

    def test_get_type_hints(self):
        self.assertIsInstance(self.store.get('feature1'), str)

    def test_set_type_hints(self):
        self.store.set('feature3', 'value3')
        self.assertIsInstance(self.store.get('feature3'), str)

    def test_all_type_hints(self):
        all_values = self.store.all()
        self.assertIsInstance(all_values, dict)

    def test_on_off_type_hints(self):
        callback = unittest.mock.MagicMock()
        self.store.on('feature-updated', callback)
        self.assertTrue(callable(callback))
        self.store.off('feature-updated', callback)
        self.assertTrue(callable(callback))

    def test_audiences_type_hints(self):
        self.assertIsInstance(self.store.audiences, list)
        self.store.audiences = ['audience2']
        self.assertIsInstance(self.store.audiences, list)

if __name__ == '__main__':
    unittest.main()
