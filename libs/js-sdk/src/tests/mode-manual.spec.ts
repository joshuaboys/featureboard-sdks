import { EffectiveFeatureValue } from '@featureboard/contracts'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { describe, expect, it } from 'vitest'
import { createBrowserClient } from '../client'

describe('Manual update mode', () => {
    it('fetches initial values', async () => {
        const values: EffectiveFeatureValue[] = [
            {
                featureKey: 'my-feature',
                value: 'service-default-value',
            },
        ]

        const server = setupServer(
            rest.get(
                'https://client.featureboard.app/effective',
                (_req, res, ctx) => res.once(ctx.json(values), ctx.status(200)),
            ),
        )
        server.listen()

        try {
            const client = createBrowserClient({
                environmentApiKey: 'fake-key',
                audiences: [],
                updateStrategy: 'manual',
            })
            await client.waitForInitialised()

            const value = client.client.getFeatureValue(
                'my-feature',
                'default-value',
            )
            expect(value).toEqual('service-default-value')
        } finally {
            server.resetHandlers()
            server.close()
        }
    })

    it('can manually update values', async () => {
        const values: EffectiveFeatureValue[] = [
            {
                featureKey: 'my-feature',
                value: 'service-default-value',
            },
        ]

        const newValues: EffectiveFeatureValue[] = [
            {
                featureKey: 'my-feature',
                value: 'new-service-default-value',
            },
        ]
        let count = 0
        const server = setupServer(
            rest.get(
                'https://client.featureboard.app/effective',
                (_req, res, ctx) => {
                    if (count > 0) {
                        return res(ctx.json(newValues), ctx.status(200))
                    }

                    count++
                    return res(ctx.json(values), ctx.status(200))
                },
            ),
        )
        server.listen()

        try {
            const client = createBrowserClient({
                environmentApiKey: 'fake-key',
                audiences: [],
                updateStrategy: 'manual',
            })
            await client.waitForInitialised()
            await client.updateFeatures()

            const value = client.client.getFeatureValue(
                'my-feature',
                'default-value',
            )
            expect(value).toEqual('new-service-default-value')
        } finally {
            server.resetHandlers()
            server.close()
        }
    })

    it('close', async () => {
        const values: EffectiveFeatureValue[] = [
            {
                featureKey: 'my-feature',
                value: 'service-default-value',
            },
        ]

        const server = setupServer(
            rest.get(
                'https://client.featureboard.app/effective',
                (_req, res, ctx) => res.once(ctx.json(values), ctx.status(200)),
            ),
        )
        server.listen()
        try {
            const client = createBrowserClient({
                environmentApiKey: 'fake-key',
                audiences: [],
                updateStrategy: 'manual',
            })

            client.close()
        } finally {
            server.resetHandlers()
            server.close()
        }
    })
})

declare module '@featureboard/js-sdk' {
    interface Features extends Record<string, string | number | boolean> {}
}
