"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight, Headphones, Clock, Shield } from "lucide-react"

const stats = [
    {
        icon: Clock,
        number: "<30min",
        label: "Average Response Time"
    },
    {
        icon: Headphones,
        number: "99.9%",
        label: "Issue Resolution Rate"
    },
    {
        icon: Shield,
        number: "24/7",
        label: "Support Available"
    }
]

export default function HeroTechSupport() {
    return (
        <section className="relative overflow-hidden bg-white sm:bg-gradient-to-br sm:from-teal-50 sm:via-white sm:to-cyan-50 py-12 md:py-16 pt-32 md:pt-40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-teal-900/20">
            <div className="container mx-auto pt-16 pb-24 px-4">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col justify-center"
                    >
                        <div className="mb-6">
                            <span className="inline-flex items-center rounded-full bg-teal-100 px-4 py-2 text-sm font-medium text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                                <Headphones className="mr-2 h-4 w-4" />
                                Technical Support Expert
                            </span>
                        </div>

                        <h1 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                            Professional{" "}
                            <span className="text-teal-600 dark:text-teal-400">Tech Support</span>{" "}
                            Services
                        </h1>

                        <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                            Get reliable technical support when you need it most. Our certified technicians provide
                            expert assistance, rapid problem resolution, and proactive maintenance to keep your
                            systems running smoothly around the clock.
                        </p>

                        <div className="mb-8 flex flex-wrap gap-4">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                                24/7 Emergency Support
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                                Remote & On-Site Assistance
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                                Certified Technicians
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center justify-center rounded-lg bg-teal-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-teal-700 hover:shadow-xl"
                            >
                                Get Support Now
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="rounded-lg border-2 border-gray-300 px-8 py-4 font-semibold text-gray-700 transition-all hover:border-teal-600 hover:text-teal-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-teal-400 dark:hover:text-teal-400"
                            >
                                View Service Plans
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
                                src="/images/featured/Technical_Support_Expert.png?height=400&width=600"
                                alt="Technical Support Services"
                                fill
                                className="object-cover shadow-2xl"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />

                            {/* Overlay with gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/80 to-cyan-600/80 rounded-2xl flex items-center justify-center">
                                <div className="text-center text-white">
                                    <h3 className="text-2xl font-bold mb-4">24/7 Support</h3>
                                    <p className="text-lg">Expert Technical Assistance</p>
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
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl"></div>
        </section>
    )
}