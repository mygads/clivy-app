import { getTranslations } from 'next-intl/server'
import { CheckCircle, Globe, Beaker, Lightbulb, Heart, Leaf, Recycle, Users, Target } from 'lucide-react'
import { Metadata } from 'next'

// Generate static params for SSG
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const isIndonesian = locale === 'id';
  
  const title = isIndonesian
    ? "Keberlanjutan Lingkungan - Genfity | Teknologi Ramah Lingkungan"
    : "Environmental Sustainability - Genfity | Eco-Friendly Technology";
    
  const description = isIndonesian
    ? "Komitmen Genfity terhadap keberlanjutan lingkungan melalui solusi teknologi ramah lingkungan, praktik bisnis yang bertanggung jawab, dan inovasi berkelanjutan untuk masa depan yang lebih hijau."
    : "Genfity's commitment to environmental sustainability through eco-friendly technology solutions, responsible business practices, and sustainable innovations for a greener future.";

  return {
    title,
    description,
    keywords: isIndonesian
      ? "keberlanjutan lingkungan, teknologi ramah lingkungan, praktik bisnis berkelanjutan, inovasi hijau, genfity sustainability"
      : "environmental sustainability, eco-friendly technology, sustainable business practices, green innovation, genfity sustainability",
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
    },
  };
}

export default async function SustainabilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'sustainability' })

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 dark:bg-dark mt-16" id="sustainability">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div>
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Environmental <span className="text-primary">Sustainability</span>
            </h2>
            <p className="mb-8 sm:mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Committed to building a greener future through sustainable technology solutions and responsible business practices
            </p>
          </div>
        </div>

        <div className="grid gap-8 sm:gap-10 md:gap-12 md:grid-cols-2">
          <div>
            <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Our Sustainability Initiatives
            </h3>

            <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Green Technology
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Utilizing energy-efficient servers and sustainable hosting solutions for all our digital services
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Recycle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Carbon Neutral Operations
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Implementing carbon offset programs and renewable energy sources to minimize our environmental footprint
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Community Impact
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Supporting local environmental initiatives and educating our community about sustainable practices
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 sm:p-6 dark:bg-gray-800">
              <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                2025 Sustainability Goals
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Carbon Footprint Reduction
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    50% by 2025
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Renewable Energy Usage
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    100% by 2026
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Green Projects Completed
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    200+ projects
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Environmental Impact Stats
            </h3>

            <div className="mb-4 sm:mb-6 space-y-4 sm:space-y-6">
              <div className="rounded-lg bg-green-50 p-4 sm:p-6 dark:bg-green-900/30">
                <div className="flex">
                  <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm sm:text-base font-bold text-green-800 dark:text-green-300">
                      25% Carbon Reduction
                    </h4>
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-400">
                      Achieved through optimized server infrastructure and cloud computing efficiency
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 sm:p-6 dark:bg-blue-900/30">
                <div className="flex">
                  <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm sm:text-base font-semibold text-blue-800 dark:text-blue-300">
                      75% Renewable Energy
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                      Current renewable energy usage across all our operations and data centers
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-purple-50 p-4 sm:p-6 dark:bg-purple-900/30">
                <div className="flex">
                  <div className="mr-3 sm:mr-4 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-300">
                    <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm sm:text-base font-semibold text-purple-800 dark:text-purple-300">
                      150+ Green Solutions
                    </h4>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400">
                      Digital solutions delivered that help clients reduce their environmental impact
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-green-500 to-blue-500 p-4 sm:p-6 text-white">
              <h4 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold">
                Partner with Us for a Greener Future
              </h4>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm opacity-90">
                Join our sustainability mission and let&apos;s build environmentally responsible digital solutions together.
              </p>
              <button className="rounded-lg bg-white px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-green-600 transition-colors hover:bg-gray-100">
                Learn More About Our Green Initiatives
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}