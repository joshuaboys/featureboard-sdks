# FeatureBoard Python SDK Usage

## Introduction

The FeatureBoard Python SDK allows you to manage feature flags in your Python applications. This document provides detailed usage instructions to help you get started.

## Installation

The FeatureBoard Python SDK is planned to be published to PyPI.

In the meantime, you can install it directly from the GitHub repository:

```bash
pip install git+https://github.com/arkahna/featureboard-sdks.git@main#egg=featureboard-python-sdk&subdirectory=libs/python-sdk
```

## Getting Started

### Importing the SDK

To use the FeatureBoard Python SDK, you need to import the `FeatureBoardClient` class from the `featureboard` module.

```python
from featureboard import FeatureBoardClient
```

### Initializing the Client

To initialize the `FeatureBoardClient`, you need to provide your API key.

```python
client = FeatureBoardClient(api_key='your_api_key')
```

### Checking Feature Flags

You can check if a feature is enabled using the `is_feature_enabled` method.

```python
if client.is_feature_enabled('new_feature'):
    print('New feature is enabled!')
else:
    print('New feature is disabled.')
```

### Updating Audiences

You can update the audiences using the `update_audiences` method.

```python
client.update_audiences(['audience1', 'audience2'])
```

### Manually Triggering Feature Updates

You can manually trigger an update to the feature state using the `update_features` method.

```python
client.update_features()
```

### Subscribing to Initialised Changes

You can subscribe to initialised changes using the `subscribe_to_initialised_changed` method.

```python
def on_initialised_changed(initialised):
    print(f'Initialised: {initialised}')

unsubscribe = client.subscribe_to_initialised_changed(on_initialised_changed)
```

### Closing the Client

You can close the subscription to the FeatureBoard service using the `close` method.

```python
client.close()
```

## Additional Documentation

For more detailed usage instructions and comprehensive examples, please refer to the following documentation files:

- [Detailed Usage Instructions](usage.md)
- [Comprehensive Examples](examples.md)
