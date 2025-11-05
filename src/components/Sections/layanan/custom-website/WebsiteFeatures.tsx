"use client"

import { motion } from "framer-motion"
import { Smartphone, Search, Shield, Zap, Palette, Code, Users, BarChart3, Globe, Lock } from "lucide-react"

const features = [
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Websites that look perfect on all devices - desktop, tablet, and mobile.",
  },
  {
    icon: Search,
    title: "SEO Optimized",
    description: "Code structure and content optimized for Google search engines.",
  },
  {
    icon: Zap,
    title: "Fast Loading",
    description: "Performance optimization for loading times under 3 seconds.",
  },
  {
    icon: Shield,
    title: "High Security",
    description: "SSL protection, automatic backups, and multi-layered security systems.",
  },
  {
    icon: Palette,
    title: "Custom Design",
    description: "Unique designs that reflect your brand identity and values.",
  },
  {
    icon: Code,
    title: "Clean Code",
    description: "Clean, structured, and easily maintainable code architecture.",
  },
  {
    icon: Users,
    title: "User Experience",
    description: "Intuitive and user-friendly interface for visitors.",
  },
  {
    icon: BarChart3,
    title: "Analytics Ready",
    description: "Google Analytics integration and other tracking tools.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Support for multi-language websites as needed.",
  },
  {
    icon: Lock,
    title: "Admin Panel",
    description: "Easy-to-use admin panel for managing website content.",
  },
]

export default function WebsiteFeatures() {
  return (
    <section className="bg-white py-12 md:py-20 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Premium <span className="text-primary">Features</span> of Our Websites
            </h2>
            <p className="mb-8 md:mb-12 text-gray-600 dark:text-gray-300 text-base md:text-lg">
              Every website we create comes equipped with modern features and cutting-edge technology to ensure
              optimal performance and the best user experience.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group rounded-lg bg-gray-50 p-6 text-center transition-all hover:bg-primary hover:text-white dark:bg-gray-800 dark:hover:bg-primary"
            >
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-white/20 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-white dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-white/90 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
