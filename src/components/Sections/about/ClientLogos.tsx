"use client"

import Image from "next/image"
import styles from './ClientLogos.module.css'

// Client logo interface
interface ClientLogoData {
  name: string;
  logo: string;
}

interface ClientLogosProps {
  data: ClientLogoData[];
  desc?: boolean;
}

// Generate unlimited logo sets for seamless scrolling
const generateLogoSets = (logos: ClientLogoData[], count: number = 12) => {
  if (!logos || !Array.isArray(logos) || logos.length === 0) return [];
  
  const sets = [];
  // Create enough sets to ensure seamless scrolling
  for (let i = 0; i < count; i++) {
    sets.push(...logos.map((logo, index) => ({
      ...logo,
      uniqueKey: `set-${i}-logo-${index}`
    })));
  }
  return sets;
};

export default function ClientLogos({ data, desc = true }: ClientLogosProps) {
  // Use provided data, fallback to empty array if no data
  const clientLogos = data || [];
  
  // If no data provided, show empty state or return null
  if (clientLogos.length === 0) {
    return null;
  }
  
  const unlimitedLogos = generateLogoSets(clientLogos);

  return (
    <section className="py-12 sm:py-16 lg:py-20 dark:bg-black overflow-hidden">
      <div className="container mx-auto px-4">
        {desc && (
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Trusted <span className="text-primary">Clients</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              We are proud to have partnered with leading companies.
            </p>
          </div>
        )}

        {/* Unlimited Running Logo Animation */}
        <div className="relative">
          <div className={`flex ${styles.scrollContainer}`}>
            {unlimitedLogos.map((client) => (
              <div
                key={client.uniqueKey}
                className="flex-shrink-0 mx-4 sm:mx-6 lg:mx-8"
              >
                <div className="rounded-lg p-3 sm:p-4 lg:p-6 transition-shadow duration-300 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center">
                  <Image
                    src={client.logo || "/placeholder.svg"}
                    alt={client.name}
                    width={120}
                    height={120}
                    className="max-w-full max-h-full w-auto h-auto object-contain transition-all duration-300 dark:brightness-0 dark:invert"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colorful Gradient Bar - Full Width Outside Container */}
      {/* <div className="w-full">
        <div 
          className="h-2.5 sm:h-3"
          style={{
            background: `linear-gradient(90deg, 
              hsl(0, 70%, 60%), 
              hsl(30, 70%, 60%), 
              hsl(60, 70%, 60%), 
              hsl(90, 70%, 60%), 
              hsl(120, 70%, 60%), 
              hsl(150, 70%, 60%), 
              hsl(180, 70%, 60%), 
              hsl(210, 70%, 60%), 
              hsl(240, 70%, 60%), 
              hsl(270, 70%, 60%), 
              hsl(300, 70%, 60%), 
              hsl(330, 70%, 60%), 
              hsl(360, 70%, 60%))`
          }}
        />
      </div> */}
    </section>
  )
}
