"use client"

import { motion } from "framer-motion"
import { BarChart3, Globe, Rocket, Shield, Smartphone, Users, Zap } from "lucide-react"

const benefits = [
    {
        icon: Users,
        title: "Enhanced User Engagement",
        description: "Mobile apps provide direct access to your customers with push notifications, offline functionality, and personalized experiences that keep users coming back.",
        stats: "3x higher engagement than mobile websites"
    },
    {
        icon: BarChart3,
        title: "Increased Revenue Opportunities",
        description: "Mobile apps generate higher conversion rates, enable in-app purchases, and create new revenue streams through premium features and subscriptions.",
        stats: "25% higher conversion rates on average"
    },
    {
        icon: Rocket,
        title: "Superior Performance",
        description: "Native and optimized cross-platform apps deliver faster loading times, smoother animations, and better overall performance compared to web alternatives.",
        stats: "50% faster than mobile web apps"
    },
    {
        icon: Shield,
        title: "Enhanced Security",
        description: "Mobile apps offer better data protection with device-level security features, encrypted storage, and secure authentication methods.",
        stats: "Enterprise-grade security standards"
    },
    {
        icon: Globe,
        title: "Offline Functionality",
        description: "Apps can work without internet connectivity, allowing users to access content and features even in areas with poor network coverage.",
        stats: "100% availability, anywhere, anytime"
    },
    {
        icon: Zap,
        title: "Device Integration",
        description: "Access device features like camera, GPS, contacts, and sensors to create rich, interactive experiences that web apps cannot match.",
        stats: "Full access to native device capabilities"
    }
]

const mobileStats = [
    {
        number: "6.8B",
        label: "Mobile phone users worldwide"
    },
    {
        number: "88%",
        label: "Time spent on mobile is in apps"
    },
    {
        number: "21x",
        label: "More likely to purchase via mobile app"
    },
    {
        number: "80%",
        label: "Of internet users own a smartphone"
    }
]

export default function MobileBenefits() {
    return (
        <section className="bg-white sm:bg-gradient-to-br sm:from-indigo-50 sm:via-white sm:to-purple-50 py-12 sm:py-16 md:py-20 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-indigo-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-4xl text-center"
                >
                    <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                        Why Your Business Needs a <span className="text-indigo-600 dark:text-indigo-400">Mobile App</span>
                    </h2>
                    <p className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Mobile applications offer unique advantages that can transform your business operations,
                        customer engagement, and revenue generation in today&apos;s mobile-first world.
                    </p>
                </motion.div>

                {/* Mobile Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {mobileStats.map((stat, index) => (
                        <div
                            key={index}
                            className="rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 text-center shadow-sm"
                        >
                            <div className="mb-1 sm:mb-2 text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                {stat.number}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Benefits Grid */}
                <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 shadow-sm transition-all hover:shadow-xl"
                        >
                            <div className="mb-4 sm:mb-6 flex items-start justify-between">
                                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                                    <benefit.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                        {benefit.stats}
                                    </div>
                                </div>
                            </div>

                            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                {benefit.title}
                            </h3>

                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white"
                >
                    <div className="mx-auto max-w-2xl">
                        <Smartphone className="mx-auto mb-6 h-16 w-16" />
                        <h3 className="mb-4 text-2xl font-bold">
                            Join the Mobile Revolution
                        </h3>
                        <p className="mb-6 text-blue-100">
                            Don&apos;t let your competitors get ahead. Start building your mobile presence today
                            and capture the growing mobile market share.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-lg bg-white px-8 py-4 font-semibold text-blue-600 transition-all hover:bg-gray-100"
                        >
                            Start Your Mobile Journey
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}