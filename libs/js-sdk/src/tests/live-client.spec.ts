import {
    EffectiveFeatureValue,
    StateOfTheWorldEffectiveValuesNotification,
} from '@featureboard/contracts'
import fetchMock from 'fetch-mock'
import { FeatureBoardService } from '../client'
import { timeout } from '../timeout'
import { connectToWsClient } from './ws-helper'

let fetch: fetchMock.FetchMockSandbox

beforeEach(() => {
    fetch = fetchMock.sandbox()
    // Default to internal server error
    fetch.catch(500)
})

describe('live client', () => {
    it('can connect to featureboard', async () => {
        const client = await FeatureBoardService.init('fake-key', [], {
            fetch,
            updateStrategy: {
                kind: 'live',
                options: {
                    websocketFactory: () =>
                        connectToWsClient((msg, ws) => {
                            if (msg.kind === 'subscribe') {
                                const stateOfTheWorld: StateOfTheWorldEffectiveValuesNotification =
                                    {
                                        kind: 'state-of-the-world-effective-values',
                                        features: [
                                            {
                                                featureKey: 'my-feature',
                                                value: 'some-value',
                                            },
                                        ],
                                    }

                                ws.send(JSON.stringify(stateOfTheWorld))
                            }
                        }),
                },
            },
        })

        expect(client.client.getFeatureValue('my-feature', 'default-val')).toBe(
            'some-value',
        )
    })

    it('can update audiences', async () => {
        const client = await FeatureBoardService.init('fake-key', [], {
            fetch,
            updateStrategy: {
                kind: 'live',
                options: {
                    websocketFactory: () =>
                        connectToWsClient((msg, ws) => {
                            if (msg.kind === 'subscribe') {
                                if (
                                    msg.mode.kind === 'effective-values' &&
                                    msg.mode.audiences.length === 0
                                ) {
                                    const stateOfTheWorld: StateOfTheWorldEffectiveValuesNotification =
                                        {
                                            kind: 'state-of-the-world-effective-values',
                                            features: [
                                                {
                                                    featureKey: 'my-feature',
                                                    value: 'some-value',
                                                },
                                            ],
                                        }

                                    ws.send(JSON.stringify(stateOfTheWorld))
                                }

                                if (
                                    msg.mode.kind === 'effective-values' &&
                                    msg.mode.audiences.length === 1
                                ) {
                                    const stateOfTheWorld: StateOfTheWorldEffectiveValuesNotification =
                                        {
                                            kind: 'state-of-the-world-effective-values',
                                            features: [
                                                {
                                                    featureKey: 'my-feature',
                                                    value: 'new-some-value',
                                                },
                                            ],
                                        }

                                    ws.send(JSON.stringify(stateOfTheWorld))
                                }
                            }
                        }),
                },
            },
        })

        await client.updateAudiences(['some-audience'])

        expect(client.client.getFeatureValue('my-feature', 'default-val')).toBe(
            'new-some-value',
        )
    })

    it('connection timeout falls back to http to get initial values, then retries in background', async () => {
        const values: EffectiveFeatureValue[] = [
            {
                featureKey: 'my-feature',
                value: 'from-http',
            },
        ]
        fetch.getOnce('https://client.featureboard.app/effective?audiences=', {
            status: 200,
            body: values,
        })

        const client = await FeatureBoardService.init('fake-key', [], {
            fetch,
            updateStrategy: {
                kind: 'live',
                options: {
                    connectTimeout: 1,
                    websocketFactory: () => connectToWsClient(() => {}),
                },
            },
        })

        // Wait for timeout of sdk
        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(client.client.getFeatureValue('my-feature', 'default-val')).toBe(
            'from-http',
        )
    })

    it('uses value from live once it reconnects', async () => {
        let serverConnectAttempts = 0

        const values: EffectiveFeatureValue[] = [
            {
                featureKey: 'my-feature',
                value: 'from-http',
            },
        ]
        fetch.getOnce('https://client.featureboard.app/effective?audiences=', {
            status: 200,
            body: values,
        })

        timeout.set = ((cb: any) => setTimeout(cb)) as any

        const client = await FeatureBoardService.init('fake-key', [], {
            fetch,
            updateStrategy: {
                kind: 'live',
                options: {
                    connectTimeout: 1,
                    websocketFactory: () =>
                        connectToWsClient((msg, ws) => {
                            serverConnectAttempts++
                            if (serverConnectAttempts > 1) {
                                if (msg.kind === 'subscribe') {
                                    const stateOfTheWorld: StateOfTheWorldEffectiveValuesNotification =
                                        {
                                            kind: 'state-of-the-world-effective-values',
                                            features: [
                                                {
                                                    featureKey: 'my-feature',
                                                    value: 'from-reconnect',
                                                },
                                            ],
                                        }

                                    ws.send(JSON.stringify(stateOfTheWorld))
                                }
                            }
                        }),
                },
            },
        })

        // Wait for timeout of sdk
        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(client.client.getFeatureValue('my-feature', 'default-val')).toBe(
            'from-reconnect',
        )
    })
})
