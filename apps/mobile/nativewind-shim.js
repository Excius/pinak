// This file patches NativeWind's CSS interop to prevent navigation context serialization errors
// The issue occurs when NativeWind tries to serialize component trees for upgrade warnings,
// which triggers navigation context getters before the NavigationContainer is ready.

// Suppress NativeWind CssInterop upgrade warnings
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  const message = args[0];
  if (typeof message === 'string' && message.includes('CssInterop upgrade warning')) {
    // Suppress NativeWind CSS interop upgrade warnings
    return;
  }
  return originalConsoleWarn.apply(console, args);
};

// Patch JSON.stringify to handle navigation context errors during serialization
const originalStringify = JSON.stringify;
JSON.stringify = function(value, replacer, space) {
  const safeReplacer = function(key, val) {
    try {
      // If there's a custom replacer, use it first
      if (typeof replacer === 'function') {
        val = replacer(key, val);
      }
      // Skip functions and symbols that might access navigation context
      if (typeof val === 'function' || typeof val === 'symbol') {
        return undefined;
      }
      return val;
    } catch (e) {
      // If accessing the value throws (like navigation context), return placeholder
      return '[Unserializable]';
    }
  };
  
  try {
    return originalStringify(value, safeReplacer, space);
  } catch (e) {
    // If stringify still fails, return a safe fallback
    return '{}';
  }
};
