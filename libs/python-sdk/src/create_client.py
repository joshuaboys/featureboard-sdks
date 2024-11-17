from effective_feature_state_store import EffectiveFeatureStateStore
from features_client import FeatureBoardClient
from log import debugLog

def create_client_internal(state_store: EffectiveFeatureStateStore) -> FeatureBoardClient:
    """
    Create a FeatureBoard client for internal SDK use.

    :param state_store: The state store instance.
    :return: A FeatureBoardClient instance.
    """
    return FeatureBoardClient(
        get_effective_values=lambda: {
            'audiences': state_store.audiences,
            'effective_values': [
                {'feature_key': key, 'value': value}
                for key, value in state_store.all().items()
                if value is not None
            ]
        },
        get_feature_value=lambda feature_key, default_value: (
            state_store.get(feature_key) or default_value
        ),
        subscribe_to_feature_value=lambda feature_key, default_value, on_value: (
            state_store.on('feature-updated', lambda updated_feature_key, value: (
                on_value(value or default_value)
                if feature_key == updated_feature_key else None
            )),
            on_value(state_store.get(feature_key) or default_value),
            lambda: state_store.off('feature-updated', lambda updated_feature_key, value: (
                on_value(value or default_value)
                if feature_key == updated_feature_key else None
            ))
        )
    )
