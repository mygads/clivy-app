"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

const comparisonData = [
  {
    feature: "Custom Design",
    us: true,
    others: false,
    description: "Unique design tailored to your brand",
  },
  {
    feature: "Responsive on All Devices",
    us: true,
    others: true,
    description: "Optimal display on desktop, tablet, and mobile",
  },
  {
    feature: "Fast Loading Speed",
    us: true,
    others: false,
    description: "Performance optimization for the best user experience",
  },
  {
    feature: "SEO Friendly",
    us: true,
    others: true,
    description: "Code structure and content optimized for search engines",
  },
  {
    feature: "24/7 Technical Support",
    us: true,
    others: false,
    description: "Support team ready to help anytime",
  },
  {
    feature: "Updates & Maintenance",
    us: true,
    others: false,
    description: "Regular maintenance for security and performance",
  },
]

export default function ComparisonSection() {
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
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              How Our <span className="text-primary">Quality</span> Compares to Others
            </h2>
            <p className="mb-12 text-gray-600 dark:text-gray-300">
              We are committed to delivering the best service with the highest quality standards
            </p>
          </motion.div>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-900">
          <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="col-span-1 font-semibold text-gray-700 dark:text-gray-300">Features</div>
            <div className="col-span-1 text-center font-semibold text-primary">Clivy</div>
            <div className="col-span-1 text-center font-semibold text-gray-700 dark:text-gray-300">Others</div>
          </div>

          {comparisonData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className={`grid grid-cols-3 p-4 ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"
                }`}
            >
              <div className="col-span-1">
                <div className="font-medium text-gray-900 dark:text-white">{item.feature}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                {item.us ? <Check className="h-6 w-6 text-green-500" /> : <X className="h-6 w-6 text-red-500" />}
              </div>
              <div className="col-span-1 flex items-center justify-center">
                {item.others ? <Check className="h-6 w-6 text-green-500" /> : <X className="h-6 w-6 text-red-500" />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
