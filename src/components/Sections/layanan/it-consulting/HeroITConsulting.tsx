"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight, Users, Shield, Zap } from "lucide-react"

const stats = [
    {
        icon: Users,
        number: "200+",
        label: "Clients Consulted"
    },
    {
        icon: Shield,
        number: "98%",
        label: "Success Rate"
    },
    {
        icon: Zap,
        number: "24/7",
        label: "Expert Support"
    }
]

export default function HeroITConsulting() {
    return (
        <section className="relative overflow-hidden bg-white sm:bg-gradient-to-br sm:from-blue-50 sm:via-white sm:to-indigo-50 py-12 md:py-16 pt-32 md:pt-40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-blue-900/20 transition-colors duration-300">
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
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Users className="mr-2 h-4 w-4" />
                                IT Consulting Expert
                            </span>
                        </div>

                        <h1 className="mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                            Strategic{" "}
                            <span className="text-blue-600 dark:text-blue-400">IT Consulting</span>{" "}
                            Solutions
                        </h1>

                        <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                            Transform your business with expert IT consulting services. We provide strategic guidance,
                            technology optimization, and digital transformation solutions that drive growth, efficiency,
                            and competitive advantage in today&apos;s digital landscape.
                        </p>

                        <div className="mb-8 flex flex-wrap gap-4">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                                Digital Transformation Strategy
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                                Technology Assessment & Planning
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                                IT Infrastructure Optimization
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
                            >
                                Schedule Consultation
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="rounded-lg border-2 border-gray-300 px-8 py-4 font-semibold text-gray-700 transition-all hover:border-blue-600 hover:text-blue-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
                            >
                                View Case Studies
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
                                src="/images/featured/IT_Consulting_Services.png?height=400&width=600"
                                alt="IT Consulting Services"
                                fill
                                className="object-cover shadow-2xl"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />

                            {/* Overlay with gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 rounded-2xl flex items-center justify-center">
                                <div className="text-center text-white">
                                    <h3 className="text-2xl font-bold mb-4">Digital Transformation</h3>
                                    <p className="text-lg">Strategic IT Solutions</p>
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
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
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
            <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl"></div>
        </section>
    )
}