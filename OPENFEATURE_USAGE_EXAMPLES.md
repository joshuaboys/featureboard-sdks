# FeatureBoard OpenFeature Usage Examples

This document provides comprehensive examples of how to use FeatureBoard with OpenFeature, including migration patterns from the native FeatureBoard SDK.

## Installation

```bash
# Install the OpenFeature packages
npm install @openfeature/web-sdk @openfeature/react-sdk

# Install the FeatureBoard OpenFeature provider
npm install @featureboard/openfeature-web-provider @featureboard/openfeature-react-provider

# Keep existing FeatureBoard packages for dual support
npm install @featureboard/js-sdk @featureboard/react-sdk
```

## Basic Usage Examples

### 1. Pure OpenFeature Implementation

```typescript
// App.tsx - Pure OpenFeature with FeatureBoard
import React from 'react';
import { OpenFeature } from '@openfeature/web-sdk';
import { OpenFeatureProvider, useFlag } from '@openfeature/react-sdk';
import { createFeatureBoardProvider } from '@featureboard/openfeature-web-provider';

// Initialize the provider
const featureBoardProvider = createFeatureBoardProvider({
  environmentApiKey: 'your-environment-api-key',
  updateStrategy: 'live',
  initialAudiences: ['beta-users', 'premium-customers']
});

// Set the provider globally
OpenFeature.setProvider(featureBoardProvider);

// Set initial context with audiences
OpenFeature.setContext({
  'featureboard.audiences': ['beta-users', 'premium-customers'],
  userId: 'user-123',
  email: 'user@example.com'
});

function MyComponent() {
  const { value: newFeatureEnabled } = useFlag('new-feature', false);
  const { value: welcomeMessage } = useFlag('welcome-message', 'Hello!');
  
  return (
    <div>
      {newFeatureEnabled && <NewFeature />}
      <h1>{welcomeMessage}</h1>
    </div>
  );
}

function App() {
  return (
    <OpenFeatureProvider>
      <MyComponent />
    </OpenFeatureProvider>
  );
}
```

### 2. FeatureBoard-Enhanced OpenFeature Provider

```typescript
// App.tsx - Using FeatureBoard's React wrapper for OpenFeature
import React, { useState } from 'react';
import { useFlag } from '@openfeature/react-sdk';
import { 
  FeatureBoardOpenFeatureProvider,
  useAudiences 
} from '@featureboard/openfeature-react-provider';

function UserProfile() {
  const { audiences, setAudiences } = useAudiences();
  const { value: premiumFeatures } = useFlag('premium-features', false);
  
  const upgradeToPremuim = () => {
    // Add premium audience when user upgrades
    setAudiences([...audiences, 'premium-customers']);
  };
  
  return (
    <div>
      <h2>Current Audiences: {audiences.join(', ')}</h2>
      {premiumFeatures ? (
        <PremiumFeatures />
      ) : (
        <button onClick={upgradeToPremuim}>Upgrade to Premium</button>
      )}
    </div>
  );
}

function App() {
  return (
    <FeatureBoardOpenFeatureProvider
      config={{
        environmentApiKey: process.env.REACT_APP_FEATUREBOARD_API_KEY!,
        updateStrategy: 'live'
      }}
      audiences={['registered-users']}
      context={{
        userId: 'user-123',
        plan: 'basic'
      }}
    >
      <UserProfile />
    </FeatureBoardOpenFeatureProvider>
  );
}
```

## Migration Examples

### 3. Gradual Migration - Side by Side

```typescript
// Migration step 1: Run both systems side by side
import React from 'react';
import { FeatureBoardProvider, useFeature } from '@featureboard/react-sdk';
import { useFlag } from '@openfeature/react-sdk';
import { createBrowserClient } from '@featureboard/js-sdk';
import { 
  FeatureBoardProviderWithOpenFeature 
} from '@featureboard/react-sdk/adapters';

const browserClient = createBrowserClient({
  environmentApiKey: 'your-api-key',
  audiences: ['beta-users'],
  updateStrategy: 'live'
});

function FeatureComponent() {
  // Using original FeatureBoard hook
  const featureBoardValue = useFeature('new-feature', false);
  
  // Using OpenFeature hook (when enabled)
  const openFeatureValue = useFlag('new-feature', false);
  
  // Compare values during migration for validation
  console.log('FeatureBoard:', featureBoardValue, 'OpenFeature:', openFeatureValue);
  
  return <div>Feature enabled: {featureBoardValue.toString()}</div>;
}

function App() {
  const [useOpenFeature, setUseOpenFeature] = useState(false);
  
  return (
    <div>
      <button onClick={() => setUseOpenFeature(!useOpenFeature)}>
        Toggle OpenFeature: {useOpenFeature ? 'ON' : 'OFF'}
      </button>
      
      <FeatureBoardProviderWithOpenFeature
        client={browserClient}
        enableOpenFeature={useOpenFeature}
      >
        <FeatureComponent />
      </FeatureBoardProviderWithOpenFeature>
    </div>
  );
}
```

### 4. Unified Hook Pattern

```typescript
// Custom hook that works with both systems during migration
import { useFeature } from '@featureboard/react-sdk';
import { useFlag } from '@openfeature/react-sdk';
import { useContext, createContext } from 'react';

interface MigrationContextType {
  useOpenFeature: boolean;
}

const MigrationContext = createContext<MigrationContextType>({ useOpenFeature: false });

export function useFeatureUnified<T>(
  featureKey: string,
  defaultValue: T
): T {
  const { useOpenFeature } = useContext(MigrationContext);
  
  if (useOpenFeature) {
    const { value } = useFlag(featureKey, defaultValue);
    return value;
  }
  
  return useFeature(featureKey, defaultValue);
}

// Usage
function MyComponent() {
  const isEnabled = useFeatureUnified('my-feature', false);
  const message = useFeatureUnified('welcome-message', 'Hello');
  
  return (
    <div>
      {isEnabled && <span>{message}</span>}
    </div>
  );
}
```

## Advanced Usage Patterns

### 5. Multi-Domain Setup

```typescript
// Using multiple providers with different domains
import { OpenFeature } from '@openfeature/web-sdk';
import { createFeatureBoardProvider } from '@featureboard/openfeature-web-provider';

// Setup different providers for different parts of the app
const mainAppProvider = createFeatureBoardProvider({
  environmentApiKey: 'main-app-key',
  initialAudiences: ['app-users']
});

const adminProvider = createFeatureBoardProvider({
  environmentApiKey: 'admin-key',
  initialAudiences: ['admin-users']
});

// Register providers with domains
OpenFeature.setProvider('main-app', mainAppProvider);
OpenFeature.setProvider('admin', adminProvider);

function MainApp() {
  return (
    <OpenFeatureProvider domain="main-app">
      <MainAppComponent />
    </OpenFeatureProvider>
  );
}

function AdminPanel() {
  return (
    <OpenFeatureProvider domain="admin">
      <AdminComponent />
    </OpenFeatureProvider>
  );
}
```

### 6. Dynamic Audience Management

```typescript
// Advanced audience management with real-time updates
import { useAudiences, useAudienceFeature } from '@featureboard/openfeature-react-provider';

function DynamicAudienceExample() {
  const { audiences, setAudiences } = useAudiences();
  
  // Special hook that provides audience information
  const {
    value: feature,
    audiences: activeAudiences,
    reason
  } = useAudienceFeature('dynamic-feature', false);
  
  const handleLocationChange = (country: string) => {
    // Dynamically update audiences based on user location
    const geoAudience = `country-${country.toLowerCase()}`;
    setAudiences([...audiences.filter(a => !a.startsWith('country-')), geoAudience]);
  };
  
  return (
    <div>
      <h3>Current Audiences: {audiences.join(', ')}</h3>
      <p>Feature active for: {activeAudiences?.join(', ')}</p>
      <p>Evaluation reason: {reason}</p>
      
      <select onChange={(e) => handleLocationChange(e.target.value)}>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="GB">United Kingdom</option>
      </select>
      
      {feature && <div>Location-specific feature is enabled!</div>}
    </div>
  );
}
```

### 7. Server-Side Rendering (SSR) Support

```typescript
// SSR-compatible setup with Next.js
import { OpenFeature } from '@openfeature/web-sdk';
import { createFeatureBoardProvider } from '@featureboard/openfeature-web-provider';

// pages/_app.tsx
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize OpenFeature provider client-side only
    if (typeof window !== 'undefined') {
      const provider = createFeatureBoardProvider({
        environmentApiKey: process.env.NEXT_PUBLIC_FEATUREBOARD_API_KEY!,
        initialAudiences: getInitialAudiences(), // From user session
      });
      
      OpenFeature.setProvider(provider);
      
      // Set context from user session
      OpenFeature.setContext({
        'featureboard.audiences': getInitialAudiences(),
        userId: getUserId(),
        ...getServerSideContext()
      });
    }
  }, []);
  
  return (
    <OpenFeatureProvider>
      <Component {...pageProps} />
    </OpenFeatureProvider>
  );
}
```

### 8. Testing with OpenFeature

```typescript
// Testing setup using OpenFeature test provider
import { OpenFeatureTestProvider } from '@openfeature/react-sdk';
import { render, screen } from '@testing-library/react';

describe('FeatureBoard OpenFeature Integration', () => {
  it('should render feature when flag is enabled', () => {
    render(
      <OpenFeatureTestProvider
        flagValueMap={{
          'new-feature': true,
          'welcome-message': 'Test Welcome!'
        }}
      >
        <MyComponent />
      </OpenFeatureTestProvider>
    );
    
    expect(screen.getByText('Test Welcome!')).toBeInTheDocument();
  });
  
  it('should handle audience-specific features', () => {
    render(
      <OpenFeatureTestProvider
        flagValueMap={{
          'premium-feature': true
        }}
        provider={{
          resolveBooleanEvaluation: (flagKey, defaultValue, context) => ({
            value: context['featureboard.audiences']?.includes('premium') ? true : defaultValue,
            reason: 'TARGETING_MATCH'
          })
        }}
      >
        <MyComponent />
      </OpenFeatureTestProvider>
    );
  });
});
```

## Migration Checklist

### Phase 1: Preparation
- [ ] Install OpenFeature packages alongside existing FeatureBoard packages
- [ ] Create feature flag to control OpenFeature enablement
- [ ] Set up dual provider wrapper component
- [ ] Add unified hooks for gradual migration

### Phase 2: Validation
- [ ] Run both systems side by side
- [ ] Compare flag values for consistency
- [ ] Test audience updates in both systems
- [ ] Validate event handling and real-time updates

### Phase 3: Migration
- [ ] Gradually enable OpenFeature for specific components
- [ ] Update import statements to use OpenFeature hooks
- [ ] Migrate context/audience management
- [ ] Update testing setup

### Phase 4: Cleanup
- [ ] Remove FeatureBoard native dependencies
- [ ] Clean up dual provider code
- [ ] Update documentation and examples
- [ ] Celebrate! 🎉

## Key Benefits of OpenFeature Integration

1. **Vendor Neutrality**: Easier to switch providers if needed
2. **Ecosystem Access**: Access to OpenFeature hooks, middleware, and tools
3. **Standardization**: Industry-standard API patterns
4. **Community**: Large OpenFeature community and contributions
5. **Future-Proofing**: Prepared for OpenFeature ecosystem growth

## Audience Management Best Practices

1. **Use Namespaced Keys**: Use `featureboard.audiences` for clarity
2. **Consistent Naming**: Use kebab-case for audience names
3. **Hierarchical Audiences**: Structure audiences hierarchically (e.g., `plan-premium`, `region-us-west`)
4. **Dynamic Updates**: Update audiences based on user actions and state changes
5. **Testing Strategy**: Test audience combinations and edge cases

This comprehensive guide should help teams migrate smoothly from FeatureBoard native to OpenFeature while maintaining all the benefits of FeatureBoard's unique audience-based targeting system.