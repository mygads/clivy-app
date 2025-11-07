import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Sign In - Clivy',
  description: 'Sign in to your Clivy account to access your dashboard and services.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SigninLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
