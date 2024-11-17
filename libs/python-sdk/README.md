# FeatureBoard Python SDK

FeatureBoard SDK for Python applications.

## Installation

The FeatureBoard Python SDK is planned to be published to PyPI.

In the meantime, you can install it directly from the GitHub repository:

```bash
pip install git+https://github.com/arkahna/featureboard-sdks.git@main#egg=featureboard-python-sdk&subdirectory=libs/python-sdk
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

## Additional Documentation

For more detailed usage instructions and comprehensive examples, please refer to the following documentation files:

- [Detailed Usage Instructions](../../docs/python-sdk/usage.md)
- [Comprehensive Examples](../../docs/python-sdk/examples.md)

## Release Notes

Our changelog can be found on [GitHub](https://github.com/arkahna/featureboard-sdks/blob/main/libs/python-sdk/CHANGELOG.md).
