"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MessageSquare, Users, Zap } from "lucide-react"

const stats = [
    {
        icon: MessageSquare,
        number: "1M+",
        label: "Messages Sent Daily"
    },
    {
        icon: Users,
        number: "99%",
        label: "Delivery Rate"
    },
    {
        icon: Zap,
        number: "24/7",
        label: "API Availability"
    }
]

export default function HeroWhatsAppAPI() {
    return (
        <section className="relative overflow-hidden bg-white sm:bg-gradient-to-br sm:from-green-50 sm:via-white sm:to-emerald-50 py-12 md:py-16 pt-32 md:pt-24 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-green-900/20">
            <div className="container mx-auto pt-16 pb-24 px-4">
                <div className="grid gap-8 md:gap-12 lg:grid-cols-2 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4 md:space-y-6"
                    >
                        <div className="mb-3 sm:mb-4">
                            <span className="inline-flex items-center rounded-full bg-green-100/70 dark:bg-green-900/30 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                                <MessageSquare className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                WhatsApp API Expert
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-gray-900 dark:text-white">
                            Powerful{" "}
                            <span className="text-green-600 dark:text-green-400">WhatsApp API</span>{" "}
                            Integration
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300 max-w-lg">
                            Connect your business with customers through WhatsApp Business API.
                            Send messages, automate conversations, and enhance customer engagement
                            with our reliable and scalable WhatsApp API service.
                        </p>

                        <div className="flex flex-wrap gap-2 sm:gap-4 pt-2">
                            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                <div className="mr-1.5 sm:mr-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></div>
                                WhatsApp Business API Integration
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                <div className="mr-1.5 sm:mr-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></div>
                                Message Automation & Templates
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                <div className="mr-1.5 sm:mr-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></div>
                                Real-time API Documentation
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                            <Link href="/#pricing">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group inline-flex items-center justify-center rounded-full bg-green-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl"
                                >
                                    Start Integration
                                    <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                                </motion.button>
                            </Link>

                            <Link href="/whatsapp/documentation">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group inline-flex items-center justify-center rounded-full border-2 border-green-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-green-600 transition-all hover:bg-green-600 hover:text-white dark:border-green-400 dark:text-green-400"
                                >
                                    View Documentation
                                </motion.button>
                            </Link>
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
                                src="/images/featured/WhatsApp_API_Integration.png?height=400&width=600"
                                alt="WhatsApp API Integration"
                                fill
                                className="object-cover shadow-2xl"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />

                            {/* Overlay with gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-emerald-600/80 rounded-lg sm:rounded-2xl flex items-center justify-center">
                                <div className="text-center text-white p-4">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4">API Integration</h3>
                                    <p className="text-sm sm:text-base md:text-lg">WhatsApp Business Connectivity</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                    className="text-center bg-white dark:bg-gray-900/70 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-300"
                                >
                                    <div className="mb-1 sm:mb-2 flex justify-center">
                                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                            <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
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
            <div className="absolute left-0 top-0 h-32 w-32 sm:h-48 sm:w-48 md:h-64 md:w-64 rounded-full bg-green-400/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-48 w-48 sm:h-64 sm:w-64 md:h-96 md:w-96 rounded-full bg-emerald-400/10 blur-3xl"></div>
        </section>
    )
}