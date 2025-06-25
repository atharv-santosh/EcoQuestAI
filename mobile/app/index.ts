import { registerRootComponent } from 'expo';

// Add web polyfills and setup
if (typeof window !== 'undefined') {
  // Ensure window object exists for web
  (window as any).__EXPO_ROUTER_IMPORT_MODE = 'sync';
  
  // Add React Native Web polyfills
  if (!(window as any).ReactNativeWeb) {
    (window as any).ReactNativeWeb = {};
  }
  
  // Ensure process is available
  if (!(window as any).process) {
    (window as any).process = { env: { NODE_ENV: 'production' } };
  }
  
  // Add global error handler
  (window as any).__EXPO_ROUTER_HYDRATE__ = false;
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
