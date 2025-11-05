"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";

interface ProvidersProps {
  children: React.ReactNode;
}

function ProvidersComponent({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" enableSystem={true} defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}

// Export memoized version to prevent HMR issues
export const Providers = React.memo(ProvidersComponent);
Providers.displayName = 'Providers';

export default Providers;
