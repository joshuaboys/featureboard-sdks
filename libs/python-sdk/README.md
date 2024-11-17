# FeatureBoard Python SDK

FeatureBoard SDK for Python applications.

## Installation

The FeatureBoard Python SDK is available on PyPI.

```bash
pip install featureboard-python-sdk
```

## Usage

Here is an example of how to use the FeatureBoard Python SDK:

```python
from featureboard import FeatureBoardClient

client = FeatureBoardClient(api_key='your_api_key')

# Check if a feature is enabled
if client.is_feature_enabled('new_feature'):
    print('New feature is enabled!')
else:
    print('New feature is disabled.')
```

## Release Notes

Our changelog can be found on [GitHub](https://github.com/arkahna/featureboard-sdks/blob/main/libs/python-sdk/CHANGELOG.md).
