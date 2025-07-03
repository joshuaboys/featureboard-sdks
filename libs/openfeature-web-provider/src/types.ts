import type { EvaluationContext } from '@openfeature/web-sdk';
import type { FeatureBoardProviderConfig } from './featureboard-provider';

/**
 * Extended configuration that includes OpenFeature-specific options
 */
export interface FeatureBoardOpenFeatureConfig extends FeatureBoardProviderConfig {
  /** Domain for the OpenFeature provider (for multi-provider setups) */
  domain?: string;
  /** Initial evaluation context */
  context?: EvaluationContext;
  /** Whether to enable suspense support */
  suspense?: boolean;
}

/**
 * Audience management configuration
 */
export interface AudienceConfig {
  /** Default audiences when none are specified */
  defaultAudiences?: string[];
  /** Whether to merge or replace audiences when updating context */
  mergeStrategy?: 'merge' | 'replace';
  /** Custom audience extraction function */
  audienceExtractor?: (context: EvaluationContext) => string[];
}

/**
 * Enhanced resolution details with audience information
 */
export interface FeatureBoardResolutionDetails<T> {
  value: T;
  reason: string;
  variant?: string;
  audiences?: string[];
  flagMetadata?: Record<string, unknown>;
}