"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FiMonitor, FiGlobe, FiDatabase, FiPenTool, FiMessageSquare, FiTrendingUp , FiServer } from "react-icons/fi"
import { Button } from "../ui/button"

type ServiceCategory = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  image: string
  features: string[]
  link: string
}

const serviceCategories: ServiceCategory[] = [
  {
    id: "website",
    name: "Custom Website Development",
    description:
      "We build websites that are not only visually stunning but also functional and optimized for conversions. From simple landing pages to complex e-commerce systems, we provide website solutions tailored to your business needs.",
    icon: <FiMonitor className="h-6 w-6" />,
    image: "/images/featured/Custom_Website_Development.png?height=400&width=600",
    features: [
      "Responsive design for all devices",
      "Optimized user experience",
      "Clean and optimized code",
      "SEO-friendly for better rankings",
      "Integration with your business systems",
    ],
    link: "/products?category=Web Development&subcategory=Landing Pages",
  },
  {
    id: "webapp",
    name: "Web Application Development",
    description:
      "Modern web applications built with cutting-edge technology to digitize your business processes. We create scalable, secure, and user-friendly web apps that streamline operations and boost productivity.",
    icon: <FiGlobe className="h-6 w-6" />,
    image: "/images/featured/Web_Application_Development.png?height=400&width=600",
    features: [
      "Real-time data processing",
      "Cloud-based architecture",
      "Advanced security features",
      "Scalable and maintainable codebase",
    ],
    link: "/products?category=Web Development&subcategory=Custom Web Apps",
  },
  {
    id: "systems",
    name: "Company Systems",
    description:
      "Comprehensive business management and automation systems designed to streamline your operations. From inventory management to CRM systems, we build custom solutions that grow with your business.",
    icon: <FiServer   className="h-6 w-6" />,
    image: "/images/featured/Company_Systems.png?height=400&width=600",
    features: [
      "Custom business management systems",
      "Automated workflow processes",
      "Real-time reporting and analytics",
      "Multi-user access control",
      "Integration with existing tools",
    ],
    link: "/products?category=Web Development&subcategory=E-Commerce",
  },
  {
    id: "design",
    name: "Graphic Design Services",
    description:
      "Professional visual design services that create compelling brand identities and marketing materials. From logos to complete brand guidelines, we ensure every design element reflects your brand values and message.",
    icon: <FiPenTool className="h-6 w-6" />,
    image: "/images/featured/Graphic_Design_Services.png?height=400&width=600",
    features: [
      "Logo and brand identity design",
      "UI/UX design for websites and apps",
      "Digital and print marketing materials",
      "Custom illustrations and infographics",
      "Comprehensive brand guidelines",
    ],
    link: "/products?category=Design Services", 
  },
]

export default function ServiceCategoryHero() {
  const [activeCategory, setActiveCategory] = useState<string>("website")

  const currentCategory = serviceCategories.find((cat) => cat.id === activeCategory)

  return (
    <section className="bg-white py-20 dark:bg-black" id="services">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Our <span className="text-primary">Featured</span> Services
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Comprehensive digital solutions to help your business thrive and grow in the digital world
            </p>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="my-12 flex flex-wrap justify-center gap-4">
          {serviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-base font-medium transition-all sm:px-4 ${
                activeCategory === category.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              title={category.name} // Accessibility: Shows tooltip on hover for mobile users
            >
              {/* Icon - always visible */}
              <span className="flex items-center justify-center">
                {category.icon}
              </span>
              {/* Text - only visible on sm screens and up */}
              <span className="hidden sm:inline">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Category Content */}
        {currentCategory && (
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div
              key={`content-${currentCategory.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-2 md:order-1"
            >
              <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{currentCategory.name}</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">{currentCategory.description}</p>

              <ul className="mb-8 space-y-3">
                {currentCategory.features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <svg
                      className="mr-2 h-5 w-5 flex-shrink-0 text-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              <Button
                variant="default"
                className=""
              >
                <Link href="/products">Browse All Services</Link>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              key={`image-${currentCategory.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-1 md:order-2"
            >
              <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
                <Image
                  src={currentCategory.image || "/placeholder.svg"}
                  alt={currentCategory.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 max-w-xs">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary">
                    {currentCategory.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white">{currentCategory.name}</h4>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}
