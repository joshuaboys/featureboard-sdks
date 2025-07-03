import { OpenFeatureEventEmitter } from '@openfeature/web-sdk';
import { FeatureBoardProvider, type FeatureBoardProviderConfig } from './featureboard-provider';

/**
 * Factory function to create a FeatureBoard OpenFeature provider
 * 
 * @param config Configuration for the FeatureBoard provider
 * @returns A new FeatureBoardProvider instance
 */
export function createFeatureBoardProvider(config: FeatureBoardProviderConfig): FeatureBoardProvider {
  const eventEmitter = new OpenFeatureEventEmitter();
  return new FeatureBoardProvider(config, eventEmitter);
}