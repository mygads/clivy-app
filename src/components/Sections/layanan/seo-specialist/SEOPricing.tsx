"use client"

import { motion } from "framer-motion"
import { Check, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const pricingPlans = [
  {
    name: "Basic SEO Optimization",
    price: "500,000",
    period: "One-Time Payment",
    description: "Perfect for new websites to get indexed and improve search engine rankings",
    features: [
      "Meta Keyword Optimization",
      "Copywriting Optimization",
      "Website Speed Optimization",
      "Alt & Image Size Optimization",
      "Website Link Building Optimization",
      "Sitemap Configuration",
      "Google Indexing Setup",
      "Bing Indexing Setup",
      "Lifetime SEO Guarantee",
    ],
    popular: false,
    buttonText: "Choose Plan Now",
  },
  {
    name: "Long-tail Keyword Package",
    price: "800,000",
    period: "Monthly Payment",
    description: "Ideal for websites that haven't optimized keywords and want to increase traffic",
    features: [
      "All Basic SEO Optimization",
      "Keyword Optimization & Analysis",
      "Target Long-tail Keywords (4-5 words)",
      "Target Indexing 10+ Keywords",
      "1 High-Quality Backlink Optimization",
      "Include 1-3 Articles Monthly",
      "Monthly Reports",
      "Effective in 3-6 Months",
      "Lifetime SEO Guarantee",
    ],
    popular: true,
    buttonText: "Choose Plan Now",
  },
  {
    name: "Focus Keyword SEO",
    price: "2,800,000",
    period: "Monthly Payment",
    description: "Perfect for competitive keyword targeting and comprehensive SEO strategy",
    features: [
      "All Basic SEO Optimization",
      "Keyword Optimization & Analysis",
      "Target Focus Keywords (2-4 words)",
      "Target Indexing 20+ Keywords",
      "1 High-Quality Backlink Optimization",
      "Include 10 Articles",
      "Monthly Reports",
      "Effective in 3-6 Months",
      "SEO Guarantee",
    ],
    popular: false,
    buttonText: "Choose Plan Now",
  },
]

export default function SEOPricing() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-white sm:via-emerald-50/30 sm:to-green-50/40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-emerald-950/20 dark:sm:to-green-950/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
            <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Our Packages</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
            Our <span className="text-green-600 dark:text-green-400">SEO</span> Optimization Packages
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 md:mb-6"></div>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            CV Genfity Digital Mediatama uses only quality methods, No Robots, No Spam & No PBN.
            Please choose one of the service packages below:
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border p-6 md:p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${plan.popular
                ? "border-green-300 dark:border-green-700 ring-2 ring-green-200 dark:ring-green-800 scale-105"
                : "border-green-100/50 dark:border-green-900/30 hover:border-green-200 dark:hover:border-green-800"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
                    <Star className="mr-2 h-4 w-4 fill-white" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6 text-center">
                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                  {plan.name}
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {plan.description}
                </p>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">IDR {plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-300">,-</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">{plan.period}</p>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500 dark:text-green-400 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full transition-all duration-300 ${plan.popular
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-600"
                  }`}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Consultation CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-green-100/50 dark:border-green-900/30 rounded-2xl p-8 shadow-lg">
            <p className="mb-4 text-gray-600 dark:text-gray-300 text-lg">
              Need a custom package or have questions?
            </p>
            <Button
              variant="outline"
              size="lg"
              className="border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-600"
            >
              Free Consultation Now
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
