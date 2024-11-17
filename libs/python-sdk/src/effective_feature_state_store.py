class EffectiveFeatureStateStore:
    def __init__(self, audiences, initial_values=None):
        self._audiences = audiences
        self._store = {}
        self.value_updated_callbacks = []

        if initial_values:
            for value in initial_values:
                self._store[value['feature_key']] = value['value']

    @property
    def audiences(self):
        return self._audiences

    @audiences.setter
    def audiences(self, value):
        self._audiences = value
        store_records = self._store.copy()
        self._store = {}
        for key in store_records:
            for callback in self.value_updated_callbacks:
                callback(key, None)

    def on(self, event, callback):
        if event == 'feature-updated':
            self.value_updated_callbacks.append(callback)

    def off(self, event, callback):
        if event == 'feature-updated':
            self.value_updated_callbacks.remove(callback)

    def all(self):
        return self._store.copy()

    def set(self, feature_key, value):
        self._store[feature_key] = value
        for callback in self.value_updated_callbacks:
            callback(feature_key, value)

    def get(self, feature_key):
        return self._store.get(feature_key)
