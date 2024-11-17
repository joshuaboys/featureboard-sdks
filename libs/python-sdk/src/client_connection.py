class BrowserClient:
    def __init__(self, client):
        self.client = client
        self.initialised = False
        self.initialised_callbacks = []
        self.initialised_error = None

    def wait_for_initialised(self):
        import time
        while not self.initialised:
            if self.initialised_error:
                raise self.initialised_error
            time.sleep(0.1)
        return self.initialised

    def subscribe_to_initialised_changed(self, callback):
        self.initialised_callbacks.append(callback)
        return lambda: self.initialised_callbacks.remove(callback)

    def update_audiences(self, audiences):
        self.initialised = False
        self.client.update_audiences(audiences)
        self.initialised = True
        for callback in self.initialised_callbacks:
            callback(self.initialised)

    def update_features(self):
        self.client.update_features()

    def close(self):
        self.client.close()
