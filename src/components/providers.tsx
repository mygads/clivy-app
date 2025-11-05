"use client";

import * as React from "react";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

function ProvidersComponent({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}

// Export memoized version to prevent HMR issues
export const Providers = React.memo(ProvidersComponent);
Providers.displayName = 'ComponentProviders';

export default Providers;
