"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

const reviews = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    company: "Fauzi Furniture",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "Our new website has increased online sales by 40% in the first 3 months. The design is professional and user-friendly.",
  },
  {
    id: 2,
    name: "Siti Rahayu",
    company: "Rahayu Catering",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "Very satisfied with our website results. The development process was fast and the team was very responsive to feedback.",
  },
  {
    id: 3,
    name: "Budi Santoso",
    company: "Santoso Property",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "The website really helps our property business. The search and property filter features work perfectly.",
  },
]

export default function BriefReviews() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="bg-light py-20 dark:bg-dark2">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            What Our <span className="text-primary dark:text-primary-dark">Clients Say</span>
          </h2>
          <p className="mb-12 text-gray-600 dark:text-gray-300">
            See how we&apos;ve helped other businesses grow with professional websites
          </p>

          <div className="relative h-[300px] overflow-hidden rounded-xl bg-gray-50 p-8 dark:bg-gray-800">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  x: activeIndex === index ? 0 : 100,
                  position: activeIndex === index ? "relative" : "absolute",
                }}
                transition={{ duration: 0.5 }}
                className="h-full w-full"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-4 h-20 w-20 overflow-hidden rounded-full">
                    <Image
                      src={review.image || "/placeholder.svg"}
                      alt={review.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="mb-2 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>

                  <p className="mb-4 text-lg italic text-gray-600 dark:text-gray-300">&quot;{review.text}&quot;</p>

                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{review.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{review.company}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-center space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-3 w-3 rounded-full transition-all ${activeIndex === index ? "bg-primary w-6" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
