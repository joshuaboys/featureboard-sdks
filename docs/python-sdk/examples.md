# FeatureBoard Python SDK Examples

## Example 1: Basic Usage

```python
from featureboard import FeatureBoardClient

client = FeatureBoardClient(api_key='your_api_key')

# Check if a feature is enabled
if client.is_feature_enabled('new_feature'):
    print('New feature is enabled!')
else:
    print('New feature is disabled.')
```

## Example 2: Updating Audiences

```python
from featureboard import FeatureBoardClient

client = FeatureBoardClient(api_key='your_api_key')

# Update audiences
client.update_audiences(['audience1', 'audience2'])

# Check if a feature is enabled for the updated audiences
if client.is_feature_enabled('new_feature'):
    print('New feature is enabled for the updated audiences!')
else:
    print('New feature is disabled for the updated audiences.')
```

## Example 3: Subscribing to Feature Updates

```python
from featureboard import FeatureBoardClient

client = FeatureBoardClient(api_key='your_api_key')

# Subscribe to feature updates
def on_feature_update(feature_key, value):
    print(f'Feature {feature_key} updated to {value}')

client.subscribe_to_feature_updates('new_feature', on_feature_update)

# Manually trigger an update to the feature state
client.update_features()
```

## Example 4: Handling Initialization

```python
from featureboard import FeatureBoardClient

client = FeatureBoardClient(api_key='your_api_key')

# Wait for the client to be initialized
client.wait_for_initialised()

# Check if a feature is enabled after initialization
if client.is_feature_enabled('new_feature'):
    print('New feature is enabled after initialization!')
else:
    print('New feature is disabled after initialization.')
```

## Example 5: Closing the Client

```python
from featureboard import FeatureBoardClient

client = FeatureBoardClient(api_key='your_api_key')

# Close the client
client.close()
```
