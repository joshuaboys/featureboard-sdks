from promise_completion_source import PromiseCompletionSource
from client_connection import BrowserClient
from create_client import create_client_internal
from effective_feature_state_store import EffectiveFeatureStateStore
from featureboard_api_config import FeatureBoardApiConfig
from featureboard_service_urls import featureBoardHostedService
from log import debugLog
from update_strategies.resolveUpdateStrategy import resolveUpdateStrategy
from update_strategies.update_strategies import UpdateStrategies
from utils.compare_arrays import compareArrays
from utils.retry import retry

def create_browser_client(update_strategy: UpdateStrategies = None, environment_api_key: str = None, api: FeatureBoardApiConfig = None, audiences: list = None, initial_values: list = None) -> BrowserClient:
    """
    Create a FeatureBoard client for use in the browser.

    This client will automatically connect to the FeatureBoard service and update the feature state.

    :param update_strategy: The method your feature state is updated.
    :param environment_api_key: The environment API key.
    :param api: Connect to a self-hosted instance of FeatureBoard.
    :param audiences: The list of audiences.
    :param initial_values: The initial values for the feature state.
    :return: A BrowserClient instance.
    """
    initial_promise = PromiseCompletionSource()
    initialised_state = {
        'initialised_callbacks': [],
        'initialised_promise': initial_promise,
        'initialised_error': None
    }
    initialised_state['initialised_promise'].promise.then(lambda: [
        callback(is_initialised()) for callback in initialised_state['initialised_callbacks']
    ] if initial_promise == initialised_state['initialised_promise'] else None)

    initialised_state['initialised_promise'].promise.catch(lambda: None)

    state_store = EffectiveFeatureStateStore(audiences, initial_values)

    update_strategy_implementation = resolveUpdateStrategy(
        update_strategy,
        environment_api_key,
        api or featureBoardHostedService
    )

    retry_cancellation_token = {'cancel': False}
    retry(lambda: update_strategy_implementation.connect(state_store), retry_cancellation_token).then(lambda: [
        initial_promise.resolve(True) if not initial_promise.completed else None
    ] if initial_promise == initialised_state['initialised_promise'] else None).catch(lambda err: [
        initialised_state.update({'initialised_error': err}),
        initialised_state['initialised_promise'].resolve(True)
    ] if not initialised_state['initialised_promise'].completed else None)

    def is_initialised() -> bool:
        """
        Check if the client is initialised.

        :return: True if initialised, False otherwise.
        """
        return initialised_state['initialised_promise'].completed

    return BrowserClient(
        client=create_client_internal(state_store),
        initialised=is_initialised(),
        wait_for_initialised=lambda: initialised_state['initialised_promise'].promise,
        subscribe_to_initialised_changed=lambda callback: [
            initialised_state['initialised_callbacks'].append(callback),
            lambda: initialised_state['initialised_callbacks'].remove(callback)
        ],
        update_audiences=lambda updated_audiences: [
            update_strategy_implementation.close(),
            retry_cancellation_token.update({'cancel': True}),
            initialised_state.update({
                'initialised_promise': PromiseCompletionSource(),
                'initialised_error': None
            }),
            initialised_state['initialised_promise'].promise.catch(lambda: None),
            initialised_state['initialised_promise'].promise.then(lambda: [
                callback(is_initialised()) for callback in initialised_state['initialised_callbacks']
            ] if initialised_state['initialised_promise'] == initialised_state['initialised_promise'] else None),
            state_store.update({'audiences': updated_audiences}),
            update_strategy_implementation.connect(state_store).then(lambda: initialised_state['initialised_promise'].resolve(True)).catch(lambda error: [
                initialised_state.update({'initialised_error': error}),
                initialised_state['initialised_promise'].resolve(True)
            ])
        ],
        update_features=lambda: update_strategy_implementation.update_features(),
        close=lambda: [
            retry_cancellation_token.update({'cancel': True}),
            update_strategy_implementation.close()
        ]
    )
