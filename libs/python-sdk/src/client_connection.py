class BrowserClient:
    def __init__(self, client):
        """
        Initialize the BrowserClient.

        :param client: The client instance.
        """
        self.client = client
        self.initialised = False
        self.initialised_callbacks = []
        self.initialised_error = None

    def wait_for_initialised(self) -> bool:
        """
        Wait for the client to be initialised.

        :return: True if initialised, raises an error if initialisation fails.
        """
        import time
        while not self.initialised:
            if self.initialised_error:
                raise self.initialised_error
            time.sleep(0.1)
        return self.initialised

    def subscribe_to_initialised_changed(self, callback: callable) -> callable:
        """
        Subscribe to initialised changes.

        :param callback: The callback function to be called when initialised changes.
        :return: A function to unsubscribe the callback.
        """
        self.initialised_callbacks.append(callback)
        return lambda: self.initialised_callbacks.remove(callback)

    def update_audiences(self, audiences: list) -> None:
        """
        Update the audiences.

        :param audiences: The list of audiences.
        """
        self.initialised = False
        self.client.update_audiences(audiences)
        self.initialised = True
        for callback in self.initialised_callbacks:
            callback(self.initialised)

    def update_features(self) -> None:
        """
        Manually trigger an update to the feature state.
        """
        self.client.update_features()

    def close(self) -> None:
        """
        Close the subscription to the FeatureBoard service.
        """
        self.client.close()
