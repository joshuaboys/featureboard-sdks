# FeatureBoard OpenFeature Migration Plan

## Executive Summary

This document outlines a comprehensive plan to port the FeatureBoard React SDK to OpenFeature while maintaining backward compatibility with the existing SDK. The migration will allow users to adopt OpenFeature standards gradually while preserving the unique audience-based targeting that FeatureBoard provides.

## Current State Analysis

### FeatureBoard SDK Architecture
- **Audience-based targeting**: Uses `audiences: string[]` instead of traditional user-based targeting
- **React SDK**: Built on top of JS SDK with React-specific providers and hooks
- **Real-time updates**: WebSocket-based live updates with subscription patterns
- **Provider pattern**: `FeatureBoardProvider` context wrapper with client management

### Key Components
1. **JS SDK**: Core client with audience management (`@featureboard/js-sdk`)
2. **React SDK**: React provider and hooks (`@featureboard/react-sdk`)
3. **Contracts**: Shared types and notification models
4. **Browser Client**: Manages connections and state synchronization

## OpenFeature Integration Strategy

### Phase 1: OpenFeature Provider Implementation (2-3 weeks)

#### 1.1 Create OpenFeature Web Provider
**Package**: `@featureboard/openfeature-web-provider`

```typescript
// libs/openfeature-web-provider/src/featureboard-provider.ts
export class FeatureBoardWebProvider implements Provider {
  readonly runsOn = 'client';
  readonly metadata: Metadata;
  private client: BrowserClient;
  private eventEmitter: OpenFeatureEventEmitter;

  constructor(config: {
    environmentApiKey: string;
    api?: FeatureBoardApiConfig;
    updateStrategy?: UpdateStrategies;
    initialAudiences?: string[];
  }) {
    // Initialize FeatureBoard browser client
    // Set up event forwarding from FeatureBoard to OpenFeature
  }

  // Map audiences from evaluation context
  private extractAudiences(context: EvaluationContext): string[] {
    return context.audiences || context['featureboard.audiences'] || [];
  }

  // Implement OpenFeature provider interface
  resolveBooleanEvaluation(flagKey: string, defaultValue: boolean, context: EvaluationContext): ResolutionDetails<boolean> {
    const audiences = this.extractAudiences(context);
    // Update client audiences if changed
    // Return feature value
  }

  // Handle context changes (audience updates)
  onContextChange(oldContext: EvaluationContext, newContext: EvaluationContext): Promise<void> {
    const oldAudiences = this.extractAudiences(oldContext);
    const newAudiences = this.extractAudiences(newContext);
    
    if (!arraysEqual(oldAudiences, newAudiences)) {
      await this.client.updateAudiences(newAudiences);
    }
  }
}
```

#### 1.2 Create OpenFeature React Provider
**Package**: `@featureboard/openfeature-react-provider`

```typescript
// libs/openfeature-react-provider/src/featureboard-openfeature-provider.tsx
export function FeatureBoardOpenFeatureProvider({
  children,
  config,
  audiences = [],
  domain,
  ...openFeatureProps
}: FeatureBoardOpenFeatureProviderProps) {
  const provider = useMemo(() => new FeatureBoardWebProvider(config), [config]);
  
  // Set up OpenFeature provider and context
  useEffect(() => {
    if (domain) {
      OpenFeature.setProvider(domain, provider);
    } else {
      OpenFeature.setProvider(provider);
    }
  }, [provider, domain]);

  // Manage audience context
  useEffect(() => {
    const context: EvaluationContext = {
      'featureboard.audiences': audiences,
      ...openFeatureProps.context
    };
    
    if (domain) {
      OpenFeature.setContext(domain, context);
    } else {
      OpenFeature.setContext(context);
    }
  }, [audiences, openFeatureProps.context, domain]);

  return (
    <OpenFeatureProvider domain={domain} {...openFeatureProps}>
      {children}
    </OpenFeatureProvider>
  );
}
```

#### 1.3 Audience Management Hooks
```typescript
// libs/openfeature-react-provider/src/hooks/use-audiences.ts
export function useAudiences(): {
  audiences: string[];
  setAudiences: (audiences: string[]) => void;
} {
  const [audiences, setAudiences] = useState<string[]>([]);
  
  const updateAudiences = useCallback(async (newAudiences: string[]) => {
    await OpenFeature.setContext({
      'featureboard.audiences': newAudiences
    });
    setAudiences(newAudiences);
  }, []);

  return { audiences, setAudiences: updateAudiences };
}
```

### Phase 2: Dual SDK Support (1-2 weeks)

#### 2.1 Adapter Layer
Create adapters that allow both APIs to coexist:

```typescript
// libs/react-sdk/src/adapters/openfeature-adapter.tsx
export function FeatureBoardProviderWithOpenFeature({
  children,
  client,
  enableOpenFeature = false,
  ...props
}: FeatureBoardProviderProps & { enableOpenFeature?: boolean }) {
  if (enableOpenFeature) {
    return (
      <FeatureBoardOpenFeatureProvider
        config={extractConfigFromClient(client)}
        {...props}
      >
        {children}
      </FeatureBoardOpenFeatureProvider>
    );
  }

  return (
    <FeatureBoardProvider client={client} {...props}>
      {children}
    </FeatureBoardProvider>
  );
}
```

#### 2.2 Feature Flag Hooks Compatibility
```typescript
// libs/react-sdk/src/hooks/use-feature-openfeature.ts
export function useFeatureOpenFeature<T extends keyof Features>(
  featureKey: T,
  defaultValue: Features[T],
): Features[T] {
  const { value } = useFlag(featureKey as string, defaultValue);
  return value as Features[T];
}

// Unified hook that works with both systems
export function useFeatureUnified<T extends keyof Features>(
  featureKey: T,
  defaultValue: Features[T],
  useOpenFeature = false,
): Features[T] {
  if (useOpenFeature) {
    return useFeatureOpenFeature(featureKey, defaultValue);
  }
  return useFeature(featureKey, defaultValue);
}
```

### Phase 3: Migration Tools and Documentation (1 week)

#### 3.1 Migration CLI Tool
```typescript
// tools/openfeature-migration/src/migrate.ts
export class FeatureBoardMigrationTool {
  migrateProviderUsage(sourceCode: string): string {
    // Convert FeatureBoardProvider to FeatureBoardOpenFeatureProvider
    // Update hook imports
    // Transform audience prop patterns
  }

  generateMigrationReport(projectPath: string): MigrationReport {
    // Scan codebase for FeatureBoard usage
    // Identify migration complexity
    // Generate step-by-step migration guide
  }
}
```

#### 3.2 Codemods
```bash
# libs/codemod-tools/
npx @featureboard/codemod migrate-to-openfeature src/
```

### Phase 4: Enhanced OpenFeature Features (2-3 weeks)

#### 4.1 Advanced Audience Management
```typescript
// Enhanced provider with audience-specific features
export class FeatureBoardAdvancedProvider extends FeatureBoardWebProvider {
  // Audience-based caching strategies
  // Complex audience targeting rules
  // A/B testing audience segmentation
  
  resolveWithAudienceRules(
    flagKey: string,
    defaultValue: any,
    context: EvaluationContext,
    audienceRules?: AudienceRule[]
  ): ResolutionDetails<any> {
    // Advanced audience-based resolution
  }
}
```

#### 4.2 OpenFeature Extensions
```typescript
// Custom OpenFeature hooks for FeatureBoard-specific features
export function useAudienceFeature<T>(
  featureKey: string,
  defaultValue: T,
  audienceConfig?: AudienceConfig
): {
  value: T;
  audiences: string[];
  variant?: string;
  reason: string;
} {
  // FeatureBoard-specific audience handling
}
```

## Implementation Timeline

### Week 1-2: Foundation
- [ ] Set up new packages (`openfeature-web-provider`, `openfeature-react-provider`)
- [ ] Implement basic OpenFeature Web Provider
- [ ] Create audience extraction and mapping logic
- [ ] Set up event forwarding (FeatureBoard → OpenFeature)

### Week 3-4: React Integration
- [ ] Implement OpenFeature React Provider wrapper
- [ ] Create audience management hooks
- [ ] Build adapter layer for dual support
- [ ] Add comprehensive tests

### Week 5: Migration Tools
- [ ] Build migration CLI tool
- [ ] Create codemods for automatic migration
- [ ] Write migration documentation
- [ ] Create example projects

### Week 6-7: Advanced Features
- [ ] Enhanced audience management
- [ ] Performance optimizations
- [ ] Advanced targeting features
- [ ] Comprehensive documentation

### Week 8: Release Preparation
- [ ] Final testing and QA
- [ ] Documentation review
- [ ] Release preparation
- [ ] Community feedback integration

## Package Structure

```
libs/
├── openfeature-web-provider/          # Core OpenFeature provider
│   ├── src/
│   │   ├── featureboard-provider.ts
│   │   ├── audience-mapper.ts
│   │   └── event-forwarder.ts
│   └── package.json
├── openfeature-react-provider/         # React-specific OpenFeature wrapper
│   ├── src/
│   │   ├── provider.tsx
│   │   ├── hooks/
│   │   └── adapters/
│   └── package.json
├── react-sdk/                         # Enhanced with OpenFeature support
│   ├── src/
│   │   ├── adapters/
│   │   ├── hooks/
│   │   └── openfeature/
│   └── package.json
└── migration-tools/                   # CLI and codemods
    ├── src/
    │   ├── cli/
    │   ├── codemods/
    │   └── analyzers/
    └── package.json
```

## Migration Strategy for Users

### Phase 1: Preparation (Recommended)
```typescript
// Current usage
<FeatureBoardProvider client={client}>
  <App />
</FeatureBoardProvider>

// Add OpenFeature support alongside existing
<FeatureBoardProviderWithOpenFeature 
  client={client}
  enableOpenFeature={false} // Start with false
>
  <App />
</FeatureBoardProviderWithOpenFeature>
```

### Phase 2: Gradual Migration
```typescript
// Enable OpenFeature
<FeatureBoardProviderWithOpenFeature 
  client={client}
  enableOpenFeature={true} // Switch to true
>
  <App />
</FeatureBoardProviderWithOpenFeature>

// Migrate hooks gradually
const feature = useFeatureUnified('my-feature', false, true);
```

### Phase 3: Full OpenFeature
```typescript
// Pure OpenFeature implementation
<FeatureBoardOpenFeatureProvider 
  config={{
    environmentApiKey: 'your-key',
    updateStrategy: 'live'
  }}
  audiences={['premium-users', 'beta-testers']}
>
  <App />
</FeatureBoardOpenFeatureProvider>

// Use standard OpenFeature hooks
const { value } = useFlag('my-feature', false);
```

## Audience Model Mapping

### FeatureBoard → OpenFeature Context Mapping
```typescript
// FeatureBoard Audiences
const audiences = ['premium-users', 'mobile-app', 'region-us'];

// OpenFeature Evaluation Context
const context: EvaluationContext = {
  targetingKey: 'user-123', // Optional, for compatibility
  'featureboard.audiences': audiences,
  // Standard OpenFeature attributes
  email: 'user@example.com',
  plan: 'premium',
  region: 'us'
};
```

## Backward Compatibility Strategy

1. **Maintain Original API**: Keep existing `@featureboard/react-sdk` API unchanged
2. **Additive Approach**: Add OpenFeature support as additional functionality
3. **Feature Flags**: Use feature flags to enable/disable OpenFeature functionality
4. **Deprecation Timeline**: Provide 12+ months notice before any breaking changes
5. **Migration Path**: Clear, automated migration tools and documentation

## Benefits of OpenFeature Integration

1. **Vendor Neutrality**: Users can switch between providers more easily
2. **Ecosystem Integration**: Access to OpenFeature tools, hooks, and extensions
3. **Standardization**: Follows industry standards for feature flag management
4. **Future-Proofing**: Prepared for OpenFeature ecosystem growth
5. **Flexibility**: Users can choose between FeatureBoard native or OpenFeature APIs

## Risk Mitigation

1. **Extensive Testing**: Comprehensive test suite for both APIs
2. **Gradual Rollout**: Phased release with feature flags
3. **Documentation**: Clear migration guides and examples
4. **Community Feedback**: Early access program for feedback
5. **Rollback Plan**: Ability to disable OpenFeature integration if issues arise

## Success Metrics

1. **Adoption Rate**: Percentage of users migrating to OpenFeature API
2. **Performance**: No degradation in flag evaluation performance
3. **Developer Experience**: Reduced migration friction and improved DX
4. **Community Engagement**: Positive feedback from OpenFeature community
5. **Compatibility**: 100% backward compatibility maintained

## Next Steps

1. **Team Alignment**: Review and approve this plan
2. **Resource Allocation**: Assign development team members
3. **Timeline Confirmation**: Confirm timeline and milestones
4. **Community Communication**: Announce OpenFeature integration plans
5. **Implementation Start**: Begin Phase 1 development

This plan provides a comprehensive approach to adopting OpenFeature while preserving FeatureBoard's unique value proposition around audience-based targeting and maintaining full backward compatibility.