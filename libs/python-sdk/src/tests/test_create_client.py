import unittest
from unittest.mock import MagicMock
from create_client import create_client_internal
from effective_feature_state_store import EffectiveFeatureStateStore

class TestCreateClientInternal(unittest.TestCase):
    def setUp(self):
        self.state_store = MagicMock(spec=EffectiveFeatureStateStore)
        self.client = create_client_internal(self.state_store)

    def test_get_effective_values(self):
        self.state_store.all.return_value = {'feature1': 'value1', 'feature2': 'value2'}
        self.state_store.audiences = ['audience1', 'audience2']
        effective_values = self.client.get_effective_values()
        self.assertEqual(effective_values['audiences'], ['audience1', 'audience2'])
        self.assertEqual(len(effective_values['effective_values']), 2)
        self.assertEqual(effective_values['effective_values'][0]['feature_key'], 'feature1')
        self.assertEqual(effective_values['effective_values'][0]['value'], 'value1')
        self.assertEqual(effective_values['effective_values'][1]['feature_key'], 'feature2')
        self.assertEqual(effective_values['effective_values'][1]['value'], 'value2')

    def test_get_feature_value(self):
        self.state_store.get.return_value = 'value1'
        feature_value = self.client.get_feature_value('feature1', 'default_value')
        self.assertEqual(feature_value, 'value1')

    def test_subscribe_to_feature_value(self):
        callback = MagicMock()
        unsubscribe = self.client.subscribe_to_feature_value('feature1', 'default_value', callback)
        self.state_store.on.assert_called_with('feature-updated', callback)
        callback.assert_called_with('default_value')
        unsubscribe()
        self.state_store.off.assert_called_with('feature-updated', callback)

    def test_get_effective_values_error(self):
        self.state_store.all.side_effect = Exception("Error fetching effective values")
        with self.assertRaises(Exception):
            self.client.get_effective_values()

    def test_get_feature_value_error(self):
        self.state_store.get.side_effect = Exception("Error fetching feature value")
        with self.assertRaises(Exception):
            self.client.get_feature_value('feature1', 'default_value')

    def test_subscribe_to_feature_value_error(self):
        self.state_store.on.side_effect = Exception("Error subscribing to feature value")
        callback = MagicMock()
        with self.assertRaises(Exception):
            self.client.subscribe_to_feature_value('feature1', 'default_value', callback)

    def test_get_effective_values_type_hints(self):
        self.state_store.all.return_value = {'feature1': 'value1', 'feature2': 'value2'}
        self.state_store.audiences = ['audience1', 'audience2']
        effective_values = self.client.get_effective_values()
        self.assertIsInstance(effective_values['audiences'], list)
        self.assertIsInstance(effective_values['effective_values'], list)
        self.assertIsInstance(effective_values['effective_values'][0]['feature_key'], str)
        self.assertIsInstance(effective_values['effective_values'][0]['value'], str)

    def test_get_feature_value_type_hints(self):
        self.state_store.get.return_value = 'value1'
        feature_value = self.client.get_feature_value('feature1', 'default_value')
        self.assertIsInstance(feature_value, str)

    def test_subscribe_to_feature_value_type_hints(self):
        callback = MagicMock()
        unsubscribe = self.client.subscribe_to_feature_value('feature1', 'default_value', callback)
        self.assertTrue(callable(unsubscribe))

if __name__ == '__main__':
    unittest.main()
