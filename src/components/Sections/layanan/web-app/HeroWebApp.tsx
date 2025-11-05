"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight, Code, Globe, Shield, Zap } from "lucide-react"

const stats = [
    {
        icon: Code,
        number: "50+",
        label: "Apps Built"
    },
    {
        icon: Zap,
        number: "99.9%",
        label: "Uptime"
    },
    {
        icon: Shield,
        number: "100%",
        label: "Secure"
    }
]

export default function HeroWebApp() {
    return (
        <section className="relative overflow-hidden bg-white sm:bg-gradient-to-br sm:from-purple-50 sm:via-white sm:to-indigo-50 py-12 md:py-16 pt-32 md:pt-40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-purple-900/20">
            <div className="container mx-auto pt-16 pb-24 px-4">
                <div className="grid gap-8 md:gap-12 lg:grid-cols-2 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col justify-center"
                    >
                        <div className="mb-6">
                            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-100 to-blue-100 px-4 py-2 text-sm font-medium text-violet-600 dark:from-violet-900/30 dark:to-blue-900/30 dark:text-violet-400">
                                <Globe className="mr-2 h-4 w-4" />
                                Web Application Expert
                            </span>
                        </div>

                        <h1 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                            Modern & Scalable{" "}
                            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-blue-400">Web Applications</span>
                        </h1>

                        <p className="mb-6 md:mb-8 text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                            Create modern, scalable web applications with advanced functionality. From simple business tools to complex enterprise solutions, we build applications that drive productivity and growth.
                        </p>

                        <div className="mb-6 md:mb-8 flex flex-wrap gap-3 md:gap-4">
                            <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                <div className="mr-2 h-2 w-2 rounded-full bg-purple-500"></div>
                                Custom web application development
                            </div>
                            <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                <div className="mr-2 h-2 w-2 rounded-full bg-purple-500"></div>
                                Progressive Web App (PWA) technology
                            </div>
                            <div className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                <div className="mr-2 h-2 w-2 rounded-full bg-purple-500"></div>
                                Scalable cloud architecture
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 md:gap-4 sm:flex-row">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group inline-flex items-center rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-violet-700 hover:to-blue-700 hover:shadow-xl"
                            >
                                Start Your Project
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group inline-flex items-center rounded-lg border-2 border-violet-600 px-8 py-4 font-semibold text-violet-600 transition-all hover:bg-gradient-to-r hover:from-violet-600 hover:to-blue-600 hover:text-white"
                            >
                                View Portfolio
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Right Content - Image & Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative h-[400px] w-full overflow-hidden rounded-2xl">
                            <Image
                                src="/images/featured/Web_Application_Development.png?height=400&width=600"
                                alt="Web Application Development"
                                fill
                                className="object-cover shadow-2xl"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />

                            {/* Overlay with gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-blue-600/80 rounded-2xl flex items-center justify-center">
                                <div className="text-center text-white">
                                    <h3 className="text-2xl font-bold mb-4">Smart Solutions</h3>
                                    <p className="text-lg">Advanced Web Applications</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="mb-2 flex justify-center">
                                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-blue-100 text-violet-600 dark:from-violet-900/30 dark:to-blue-900/30 dark:text-violet-400">
                                            <stat.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                                        </div>
                                    </div>
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                        {stat.number}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl"></div>
        </section>
    )
}