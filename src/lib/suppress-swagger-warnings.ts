// Suppress warnings from swagger-ui-react
const originalError = console.error;
const originalWarn = console.warn;

if (typeof window !== 'undefined') {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('UNSAFE_componentWillReceiveProps') ||
       args[0].includes('ModelCollapse'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('UNSAFE_componentWillReceiveProps') ||
       args[0].includes('ModelCollapse'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
}

export {};
