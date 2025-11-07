import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Sign Up - Clivy',
  description: 'Create your Clivy account to get started with our digital services.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
