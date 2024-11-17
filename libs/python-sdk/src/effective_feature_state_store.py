class EffectiveFeatureStateStore:
    def __init__(self, audiences: list, initial_values: list = None):
        """
        Initialize the EffectiveFeatureStateStore.

        :param audiences: The list of audiences.
        :param initial_values: The initial values for the feature state.
        """
        self._audiences = audiences
        self._store = {}
        self.value_updated_callbacks = []

        if initial_values:
            for value in initial_values:
                self._store[value['feature_key']] = value['value']

    @property
    def audiences(self) -> list:
        """
        Get the list of audiences.

        :return: The list of audiences.
        """
        return self._audiences

    @audiences.setter
    def audiences(self, value: list):
        """
        Set the list of audiences.

        :param value: The new list of audiences.
        """
        self._audiences = value
        store_records = self._store.copy()
        self._store = {}
        for key in store_records:
            for callback in self.value_updated_callbacks:
                callback(key, None)

    def on(self, event: str, callback: callable):
        """
        Register a callback for the specified event.

        :param event: The event to register the callback for.
        :param callback: The callback function to be called when the event occurs.
        """
        if event == 'feature-updated':
            self.value_updated_callbacks.append(callback)

    def off(self, event: str, callback: callable):
        """
        Unregister a callback for the specified event.

        :param event: The event to unregister the callback for.
        :param callback: The callback function to be unregistered.
        """
        if event == 'feature-updated':
            self.value_updated_callbacks.remove(callback)

    def all(self) -> dict:
        """
        Get all feature values.

        :return: A dictionary of all feature values.
        """
        return self._store.copy()

    def set(self, feature_key: str, value: any):
        """
        Set the value for a feature.

        :param feature_key: The key of the feature.
        :param value: The value of the feature.
        """
        self._store[feature_key] = value
        for callback in self.value_updated_callbacks:
            callback(feature_key, value)

    def get(self, feature_key: str) -> any:
        """
        Get the value of a feature.

        :param feature_key: The key of the feature.
        :return: The value of the feature, or None if the feature does not exist.
        """
        return self._store.get(feature_key)
