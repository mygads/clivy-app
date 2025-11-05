"use client"

import { motion } from "framer-motion"
import { Apple, ArrowRight, Globe, Monitor, Smartphone, Users } from "lucide-react"

const platforms = [
    {
        icon: Apple,
        title: "iOS Development",
        description: "Native iOS apps built with Swift and Objective-C for optimal performance and seamless integration with Apple ecosystem."
    },
    {
        icon: Smartphone,
        title: "Android Development",
        description: "Native Android apps using Kotlin and Java, optimized for diverse device configurations and Android features."
    },
    {
        icon: Globe,
        title: "Cross-Platform Solutions",
        description: "Efficient React Native and Flutter apps that run seamlessly on both iOS and Android with shared codebase."
    },
    {
        icon: Monitor,
        title: "Progressive Web Apps",
        description: "Modern PWAs that combine web and mobile app features, providing app-like experience across all devices."
    }
]

const technologies = [
    { name: "React Native", category: "Cross-Platform" },
    { name: "Flutter", category: "Cross-Platform" },
    { name: "Swift", category: "iOS Native" },
    { name: "Kotlin", category: "Android Native" },
    { name: "Java", category: "Android Native" },
    { name: "Objective-C", category: "iOS Native" },
    { name: "Xamarin", category: "Cross-Platform" },
    { name: "Ionic", category: "Hybrid" }
]

export default function MobileOverview() {
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
                        Complete Mobile Development Solutions
                    </h2>
                    <p className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        From native iOS and Android apps to cross-platform solutions, we deliver mobile applications
                        that provide exceptional user experiences and drive business results.
                    </p>
                </motion.div>

                {/* Platform Cards */}
                <div className="mb-12 sm:mb-16 grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {platforms.map((platform, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-sm transition-all hover:shadow-xl hover:bg-indigo-50/70 dark:hover:bg-indigo-900/20"
                        >
                            <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                                <platform.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <h3 className="mb-2 sm:mb-3 text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                {platform.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                {platform.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Technologies Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 md:p-12 shadow-sm"
                >
                    <div className="text-center">
                        <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Technologies We Master
                        </h3>
                        <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                            We use cutting-edge technologies and frameworks to build robust, scalable mobile applications
                        </p>
                    </div>

                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {technologies.map((tech, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-3 sm:p-4 text-center shadow-sm"
                            >
                                <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                                    {tech.name}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    {tech.category}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-12 sm:mt-16 text-center"
                >
                    <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        Ready to Build Your Mobile App?
                    </h3>
                    <p className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        Let&apos;s discuss your mobile app requirements and create a solution that exceeds your expectations
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group inline-flex items-center rounded-lg bg-indigo-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl"
                    >
                        Get Free Consultation
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}