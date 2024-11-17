import unittest
from unittest.mock import MagicMock, patch
from create_browser_client import create_browser_client

class TestCreateBrowserClient(unittest.TestCase):
    @patch('create_browser_client.PromiseCompletionSource')
    @patch('create_browser_client.resolveUpdateStrategy')
    @patch('create_browser_client.EffectiveFeatureStateStore')
    def test_create_browser_client(self, MockEffectiveFeatureStateStore, MockResolveUpdateStrategy, MockPromiseCompletionSource):
        mock_update_strategy = MagicMock()
        MockResolveUpdateStrategy.return_value = mock_update_strategy
        mock_state_store = MagicMock()
        MockEffectiveFeatureStateStore.return_value = mock_state_store
        mock_initial_promise = MagicMock()
        MockPromiseCompletionSource.return_value = mock_initial_promise

        client = create_browser_client(
            update_strategy='manual',
            environment_api_key='test_key',
            api=None,
            audiences=['audience1'],
            initial_values=[]
        )

        self.assertIsNotNone(client)
        self.assertTrue(hasattr(client, 'client'))
        self.assertTrue(hasattr(client, 'initialised'))
        self.assertTrue(hasattr(client, 'wait_for_initialised'))
        self.assertTrue(hasattr(client, 'subscribe_to_initialised_changed'))
        self.assertTrue(hasattr(client, 'update_audiences'))
        self.assertTrue(hasattr(client, 'update_features'))
        self.assertTrue(hasattr(client, 'close'))

    @patch('create_browser_client.PromiseCompletionSource')
    @patch('create_browser_client.resolveUpdateStrategy')
    @patch('create_browser_client.EffectiveFeatureStateStore')
    def test_create_browser_client_error_handling(self, MockEffectiveFeatureStateStore, MockResolveUpdateStrategy, MockPromiseCompletionSource):
        mock_update_strategy = MagicMock()
        MockResolveUpdateStrategy.return_value = mock_update_strategy
        mock_state_store = MagicMock()
        MockEffectiveFeatureStateStore.return_value = mock_state_store
        mock_initial_promise = MagicMock()
        MockPromiseCompletionSource.return_value = mock_initial_promise

        mock_update_strategy.connect.side_effect = Exception("Connection failed")

        with self.assertRaises(Exception):
            create_browser_client(
                update_strategy='manual',
                environment_api_key='test_key',
                api=None,
                audiences=['audience1'],
                initial_values=[]
            )

    @patch('create_browser_client.PromiseCompletionSource')
    @patch('create_browser_client.resolveUpdateStrategy')
    @patch('create_browser_client.EffectiveFeatureStateStore')
    def test_create_browser_client_type_hints(self, MockEffectiveFeatureStateStore, MockResolveUpdateStrategy, MockPromiseCompletionSource):
        mock_update_strategy = MagicMock()
        MockResolveUpdateStrategy.return_value = mock_update_strategy
        mock_state_store = MagicMock()
        MockEffectiveFeatureStateStore.return_value = mock_state_store
        mock_initial_promise = MagicMock()
        MockPromiseCompletionSource.return_value = mock_initial_promise

        client = create_browser_client(
            update_strategy='manual',
            environment_api_key='test_key',
            api=None,
            audiences=['audience1'],
            initial_values=[]
        )

        self.assertIsInstance(client.client, MagicMock)
        self.assertIsInstance(client.initialised, bool)
        self.assertTrue(callable(client.wait_for_initialised))
        self.assertTrue(callable(client.subscribe_to_initialised_changed))
        self.assertTrue(callable(client.update_audiences))
        self.assertTrue(callable(client.update_features))
        self.assertTrue(callable(client.close))

if __name__ == '__main__':
    unittest.main()
