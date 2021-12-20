import { EffectiveFeatureValue } from '@featureboard/contracts'
import { EffectiveFeaturesState } from '../effective-feature-state'
import { FetchSignature } from './FetchSignature'
import { httpClientDebug } from './http-log'

export async function fetchFeaturesConfigurationViaHttp(
    fetch: FetchSignature,
    effectiveEndpoint: string,
    environmentApiKey: string,
    state: EffectiveFeaturesState,
    lastModified: string | undefined,
) {
    httpClientDebug('Fetching updates')
    const response = await fetch(effectiveEndpoint, {
        method: 'GET',
        headers: {
            'x-environment-key': environmentApiKey,
            ...(lastModified ? { 'if-modified-since': lastModified } : {}),
        },
    })

    if (response.status !== 200 && response.status !== 304) {
        throw new Error(
            `Failed to get latest toggles: Service returned error ${response.status} (${response.statusText})`,
        )
    }

    // Expect most times will just get a response from the HEAD request saying no updates
    if (response.status === 304) {
        httpClientDebug('No changes')
        return lastModified
    }

    const allValues: EffectiveFeatureValue[] = await response.json()

    for (const featureValue of allValues) {
        state.updateFeatureValue(featureValue.featureKey, featureValue.value)
    }

    return response.headers.get('last-modified') || undefined
}
