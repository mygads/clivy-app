"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const testimonials = [
  {
    quote: "Our new website has increased online sales by 40% in the first 3 months.",
    author: "Ahmad Fauzi",
    company: "Fauzi Furniture",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote: "The team is very professional and responsive. They understand our business needs well.",
    author: "Siti Rahayu",
    company: "Rahayu Catering",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote: "The website design is very attractive and matches our brand identity perfectly.",
    author: "Budi Santoso",
    company: "Santoso Property",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export default function TrustedSection() {
  return (
    <section className="bg-white py-20 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Trusted by <span className="text-primary">Local Businesses</span>
            </h2>
            <p className="mb-12 text-gray-600 dark:text-gray-300">
              See what our clients say about our services
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-xl bg-gray-50 p-6 shadow-sm dark:bg-gray-800"
            >
              <div className="mb-4 text-primary">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="mb-4 text-gray-600 dark:text-gray-300">{testimonial.quote}</p>
              <div className="flex items-center">
                <div className="mr-3 h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.author}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 rounded-xl bg-primary p-8 text-white">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-2xl font-bold">Ready to Enhance Your Online Presence?</h3>
              <p className="mb-6">
                Join hundreds of businesses that have trusted us with their website development.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center rounded-lg bg-white px-6 py-3 font-medium text-primary transition-colors hover:bg-gray-100"
              >
                Free Consultation
              </a>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">150+</div>
                <p className="mt-2">Projects Completed</p>
                <div className="mt-4 text-4xl font-bold">98%</div>
                <p className="mt-2">Satisfied Clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
