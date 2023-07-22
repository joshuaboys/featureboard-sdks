import { FeatureConfiguration } from '@featureboard/contracts'
import { ExternalStateStore } from './external-state-store'
import { debugLog } from './log'

const stateStoreDebug = debugLog.extend('state-store')

export class AllFeatureStateStore {
    private _store: Record<string, FeatureConfiguration | undefined> = {}
    private _externalStateStore: ExternalStateStore | undefined
    private featureUpdatedCallbacks: Array<
        (featureKey: string, values: FeatureConfiguration | undefined) => void
    > = []

    constructor(externalStateStore?: ExternalStateStore) {
        this._externalStateStore = externalStateStore
    }

    async initialiseExternalStateStore(): Promise<boolean> {
        if (!this._externalStateStore) {
            return Promise.resolve(false)
        }
        stateStoreDebug('Initialising external state store')

        try {
            const externalStore = await this._externalStateStore.all()

            this._store = { ...externalStore }
            Object.keys(externalStore).forEach((key) => {
                this.featureUpdatedCallbacks.forEach((valueUpdated) =>
                    valueUpdated(key, externalStore[key]),
                )
            })
        } catch (error: any) {
            stateStoreDebug(
                'Initialise effective state store with external state store failed',
                error,
            )
            throw error
        }
        return Promise.resolve(true)
    }

    all(): Record<string, FeatureConfiguration | undefined> {
        stateStoreDebug('all: %o', this._store)
        return { ...this._store }
    }

    get(featureKey: string): FeatureConfiguration | undefined {
        const value = this._store[featureKey]
        stateStoreDebug("get '%s': %o", featureKey, value)
        return value
    }

    set(featureKey: string, value: FeatureConfiguration | undefined) {
        stateStoreDebug("set '%s': %o", featureKey, value)
        this._store[featureKey] = value
        this.featureUpdatedCallbacks.forEach((valueUpdated) =>
            valueUpdated(featureKey, value),
        )
    }

    on(
        _event: 'feature-updated',
        callback: (
            featureKey: string,
            values: FeatureConfiguration | undefined,
        ) => void,
    ): void {
        this.featureUpdatedCallbacks.push(callback)
    }

    off(
        _event: 'feature-updated',
        callback: (
            featureKey: string,
            values: FeatureConfiguration | undefined,
        ) => void,
    ): void {
        this.featureUpdatedCallbacks.splice(
            this.featureUpdatedCallbacks.indexOf(callback),
            1,
        )
    }
}
