"use client"

import { motion } from "framer-motion"
import { Globe, Search, ShoppingCart, Users } from "lucide-react"

const reasons = [
  {
    icon: Globe,
    title: "24/7 Online Presence",
    description:
      "Your website works around the clock, providing information and services even when you're resting.",
  },
  {
    icon: Search,
    title: "Increases Credibility",
    description:
      "A professional website increases customer trust and makes your business look more credible.",
  },
  {
    icon: ShoppingCart,
    title: "Expands Market Reach",
    description: "Reach potential customers worldwide without geographical limitations.",
  },
  {
    icon: Users,
    title: "Build Customer Relationships",
    description: "Interact with customers through content, contact forms, and integrated social media.",
  },
]

export default function WhyWebsiteImportant() {
  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Why Websites Are <span className="text-primary">Essential</span> for Your Business
            </h2>
            <p className="mb-12 text-gray-600 dark:text-gray-300">
              In today&apos;s digital era, a website is no longer just an option, but a necessity for every business
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {reasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <reason.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{reason.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{reason.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
