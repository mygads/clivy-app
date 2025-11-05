"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Particles } from "@/components/ui/particles"
import { WordRotate } from "@/components/ui/word-rotate";
import { Button } from "../ui/button"

export default function HeroSection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative flex min-h-[40rem] w-full items-center justify-center overflow-hidden bg-white px-4 py-16 dark:bg-dark sm:min-h-[45rem] sm:px-6 sm:bg-gradient-to-b sm:from-white sm:to-neutral-100 dark:sm:from-primary-dark/20 dark:sm:via-dark dark:sm:to-primary-dark/10 md:min-h-[50rem] md:px-8 lg:px-12">
      <Particles
        className="absolute inset-0 z-0"
      />

      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      {/* Bottom blur gradient transition - only visible in dark mode */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-transparent via-transparent to-transparent backdrop-blur-0 dark:bg-gradient-to-t dark:from-black/80 dark:via-black/40 dark:to-transparent dark:backdrop-blur-sm sm:h-28 md:h-32"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-4xl text-center"
      >
        <h1 className="relative z-20 mb-4 text-3xl font-bold leading-tight tracking-tight text-black dark:text-white sm:mb-6 sm:text-4xl sm:leading-tight md:text-5xl md:leading-relaxed lg:text-6xl xl:text-7xl">
          <span className="block sm:inline">
            Everything You Need To{" "}
          </span>
          <span className="block sm:inline">
            <WordRotate
              words={["Transform", "Grow", "Scale", "Boost", "Digitize"]}
              className="text-primary dark:text-primary-dark"
              duration={2500}
            />
          </span>{" "}
          <span className="block sm:inline">
            Your Business
          </span>
        </h1>

        <p className="relative z-20 mb-6 mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-200 sm:mb-8 sm:text-lg md:text-xl lg:max-w-3xl" style={{willChange: 'auto', contain: 'layout style'}}>
          Professional websites, smart business systems, WhatsApp automation, and IT consulting. Everything your business needs to succeed in the digital world.
        </p>

        <motion.button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative z-20 overflow-hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl sm:px-6 sm:py-3 md:text-base"
        >
          <span className="relative z-10 flex items-center justify-center">
            <span className="hidden sm:inline">Start Your Digital Journey</span>
            <span className="sm:hidden">Get Started</span>
            <ArrowRight
              className={`ml-2 h-4 w-4 transition-transform duration-300 sm:h-5 sm:w-5 ${isHovered ? "translate-x-1" : ""}`}
            />
          </span>
          <span className="absolute bottom-0 left-0 h-full w-0 bg-primary-dark transition-all duration-300 group-hover:w-full"></span>
        </motion.button>
      </motion.div>

      {/* Background elements - positioned within container bounds with proper clipping */}
      <div className="absolute left-4 top-8 h-24 w-24 rounded-full bg-primary/10 dark:bg-transparent sm:left-8 sm:top-12 sm:h-32 sm:w-32 md:left-12 md:top-16 md:h-40 md:w-40 lg:left-16 lg:top-20 lg:h-48 lg:w-48"></div>
      <div className="absolute bottom-8 right-4 h-32 w-32 rounded-full bg-primary/5 dark:bg-transparent sm:bottom-12 sm:right-8 sm:h-40 sm:w-40 md:bottom-16 md:right-12 md:h-48 md:w-48 lg:bottom-20 lg:right-16 lg:h-56 lg:w-56"></div>
    </div>
  );
}
