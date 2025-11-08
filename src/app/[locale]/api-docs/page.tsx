'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import '@/lib/suppress-swagger-warnings';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-dark pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="swagger-container">
          {isClient && <SwaggerUI url="/api/docs" />}
        </div>
      </div>
    </div>
  );
}
