import unittest
from unittest.mock import MagicMock
from client_connection import BrowserClient

class TestBrowserClient(unittest.TestCase):
    def setUp(self):
        self.client = MagicMock()
        self.browser_client = BrowserClient(self.client)

    def test_wait_for_initialised(self):
        self.browser_client.initialised = True
        self.assertTrue(self.browser_client.wait_for_initialised())

    def test_subscribe_to_initialised_changed(self):
        callback = MagicMock()
        unsubscribe = self.browser_client.subscribe_to_initialised_changed(callback)
        self.browser_client.initialised = True
        for cb in self.browser_client.initialised_callbacks:
            cb(self.browser_client.initialised)
        callback.assert_called_with(True)
        unsubscribe()
        self.assertNotIn(callback, self.browser_client.initialised_callbacks)

    def test_update_audiences(self):
        self.browser_client.update_audiences(['audience1'])
        self.assertTrue(self.browser_client.initialised)
        self.client.update_audiences.assert_called_with(['audience1'])

    def test_update_features(self):
        self.browser_client.update_features()
        self.client.update_features.assert_called_once()

    def test_close(self):
        self.browser_client.close()
        self.client.close.assert_called_once()

if __name__ == '__main__':
    unittest.main()
