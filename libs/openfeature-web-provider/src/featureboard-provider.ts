import type {
    BrowserClient,
    FeatureBoardApiConfig,
    UpdateStrategies
} from '@featureboard/js-sdk';
import { createBrowserClient } from '@featureboard/js-sdk';
import type {
    EvaluationContext,
    JsonValue,
    Logger,
    OpenFeatureEventEmitter,
    Provider,
    ProviderMetadata,
    ResolutionDetails,
} from '@openfeature/web-sdk';
import { ProviderEvents } from '@openfeature/web-sdk';
import { debugLog } from './debug';

/**
 * Configuration for the FeatureBoard OpenFeature provider
 */
export interface FeatureBoardProviderConfig {
  /** FeatureBoard environment API key */
  environmentApiKey: string;
  /** Optional API configuration for self-hosted instances */
  api?: FeatureBoardApiConfig;
  /** Update strategy for real-time flag updates */
  updateStrategy?: UpdateStrategies['kind'] | UpdateStrategies;
  /** Initial audiences for flag evaluation */
  initialAudiences?: string[];
  /** Timeout for API calls in milliseconds */
  timeout?: number;
}

/**
 * OpenFeature provider for FeatureBoard
 * 
 * This provider integrates FeatureBoard's audience-based feature flag system
 * with the OpenFeature standard, allowing users to leverage OpenFeature's
 * ecosystem while maintaining FeatureBoard's unique audience targeting capabilities.
 */
export class FeatureBoardProvider implements Provider {
  readonly metadata: ProviderMetadata = {
    name: 'FeatureBoard Provider',
  };

  readonly runsOn = 'client' as const;

  private browserClient: BrowserClient;
  private currentAudiences: string[] = [];
  private isReady = false;
  private eventEmitter: OpenFeatureEventEmitter;

  constructor(
    config: FeatureBoardProviderConfig,
    eventEmitter: OpenFeatureEventEmitter,
  ) {
    this.eventEmitter = eventEmitter;
    this.currentAudiences = config.initialAudiences || [];

    debugLog('Initializing FeatureBoard provider with config: %o', {
      environmentApiKey: config.environmentApiKey.substring(0, 8) + '...',
      updateStrategy: config.updateStrategy,
      initialAudiences: this.currentAudiences,
    });

    // Create FeatureBoard browser client
    this.browserClient = createBrowserClient({
      environmentApiKey: config.environmentApiKey,
      api: config.api,
      updateStrategy: config.updateStrategy || 'live',
      audiences: this.currentAudiences,
    });

    this.setupEventHandlers();
  }

  /**
   * Set up event handlers to forward FeatureBoard events to OpenFeature
   */
  private setupEventHandlers(): void {
    // Handle initialization
    this.browserClient.subscribeToInitialisedChanged((initialized) => {
      if (initialized && !this.isReady) {
        this.isReady = true;
        debugLog('FeatureBoard client initialized successfully');
        this.eventEmitter.emit(ProviderEvents.Ready, {
          providerName: this.metadata.name,
        });
      } else if (!initialized && this.isReady) {
        this.isReady = false;
        debugLog('FeatureBoard client disconnected');
        this.eventEmitter.emit(ProviderEvents.Stale, {
          providerName: this.metadata.name,
        });
      }
    });

    // Wait for initial connection and handle errors
    this.browserClient.waitForInitialised().catch((error) => {
      debugLog('FeatureBoard client initialization failed: %o', error);
      this.eventEmitter.emit(ProviderEvents.Error, {
        providerName: this.metadata.name,
        message: error.message || 'Failed to initialize FeatureBoard client',
      });
    });

    // TODO: Add support for configuration change events when FeatureBoard supports them
    // This would allow real-time flag updates to trigger OpenFeature configuration changed events
  }

  /**
   * Extract audiences from OpenFeature evaluation context
   */
  private extractAudiences(context: EvaluationContext): string[] {
    // Support multiple ways to specify audiences for flexibility
    const audiences = 
      context['featureboard.audiences'] || 
      context.audiences || 
      [];

    if (Array.isArray(audiences)) {
      return audiences.filter((audience): audience is string => 
        typeof audience === 'string'
      );
    }

    return [];
  }

  /**
   * Update audiences if they have changed
   */
  private async updateAudiencesIfChanged(newAudiences: string[]): Promise<void> {
    // Compare audiences (order doesn't matter)
    const currentSet = new Set(this.currentAudiences);
    const newSet = new Set(newAudiences);
    
    const hasChanged = 
      currentSet.size !== newSet.size ||
      !Array.from(currentSet).every(audience => newSet.has(audience));

    if (hasChanged) {
      debugLog('Updating audiences from %o to %o', this.currentAudiences, newAudiences);
      
      try {
        await this.browserClient.updateAudiences(newAudiences);
        this.currentAudiences = [...newAudiences];
        
        debugLog('Audiences updated successfully');
      } catch (error) {
        debugLog('Failed to update audiences: %o', error);
        throw error;
      }
    }
  }

  /**
   * Handle evaluation context changes (primarily audience updates)
   */
  async onContextChange(
    oldContext: EvaluationContext,
    newContext: EvaluationContext,
  ): Promise<void> {
    const newAudiences = this.extractAudiences(newContext);
    await this.updateAudiencesIfChanged(newAudiences);
  }

  /**
   * Initialize the provider
   */
  async initialize(context?: EvaluationContext): Promise<void> {
    if (context) {
      const audiences = this.extractAudiences(context);
      await this.updateAudiencesIfChanged(audiences);
    }

    // Wait for FeatureBoard client to be ready
    await this.browserClient.waitForInitialised();
  }

  /**
   * Clean up resources
   */
  async onClose(): Promise<void> {
    debugLog('Closing FeatureBoard provider');
    await this.browserClient.close();
  }

  /**
   * Resolve boolean flag value
   */
  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger?: Logger,
  ): ResolutionDetails<boolean> {
    try {
      const value = this.browserClient.client.getFeatureValue(flagKey, defaultValue);
      
      debugLog('Resolved boolean flag: %s = %o (default: %o)', flagKey, value, defaultValue);
      
      return {
        value: value as boolean,
        reason: this.isReady ? 'TARGETING_MATCH' : 'DEFAULT',
        variant: this.isReady ? 'enabled' : 'default',
      };
    } catch (error) {
      logger?.warn(`Failed to resolve boolean flag "${flagKey}":`, error);
      return {
        value: defaultValue,
        reason: 'ERROR',
        errorCode: 'GENERAL',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Resolve string flag value
   */
  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
    logger?: Logger,
  ): ResolutionDetails<string> {
    try {
      const value = this.browserClient.client.getFeatureValue(flagKey, defaultValue);
      
      debugLog('Resolved string flag: %s = %o (default: %o)', flagKey, value, defaultValue);
      
      return {
        value: value as string,
        reason: this.isReady ? 'TARGETING_MATCH' : 'DEFAULT',
        variant: this.isReady ? 'enabled' : 'default',
      };
    } catch (error) {
      logger?.warn(`Failed to resolve string flag "${flagKey}":`, error);
      return {
        value: defaultValue,
        reason: 'ERROR',
        errorCode: 'GENERAL',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Resolve number flag value
   */
  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
    logger?: Logger,
  ): ResolutionDetails<number> {
    try {
      const value = this.browserClient.client.getFeatureValue(flagKey, defaultValue);
      
      debugLog('Resolved number flag: %s = %o (default: %o)', flagKey, value, defaultValue);
      
      return {
        value: value as number,
        reason: this.isReady ? 'TARGETING_MATCH' : 'DEFAULT',
        variant: this.isReady ? 'enabled' : 'default',
      };
    } catch (error) {
      logger?.warn(`Failed to resolve number flag "${flagKey}":`, error);
      return {
        value: defaultValue,
        reason: 'ERROR',
        errorCode: 'GENERAL',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Resolve object flag value
   */
  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
    logger?: Logger,
  ): ResolutionDetails<T> {
    try {
      const value = this.browserClient.client.getFeatureValue(flagKey, defaultValue);
      
      debugLog('Resolved object flag: %s = %o (default: %o)', flagKey, value, defaultValue);
      
      return {
        value: value as T,
        reason: this.isReady ? 'TARGETING_MATCH' : 'DEFAULT',
        variant: this.isReady ? 'enabled' : 'default',
      };
    } catch (error) {
      logger?.warn(`Failed to resolve object flag "${flagKey}":`, error);
      return {
        value: defaultValue,
        reason: 'ERROR',
        errorCode: 'GENERAL',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}