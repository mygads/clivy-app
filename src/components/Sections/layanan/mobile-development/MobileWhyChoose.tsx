"use client"

import { motion } from "framer-motion"
import { Award, Clock, Code, Headphones, Shield, Users } from "lucide-react"

const reasons = [
    {
        icon: Code,
        title: "Expert Mobile Developers",
        description: "Our team consists of certified mobile developers with extensive experience in iOS, Android, and cross-platform development.",
        stats: "5+ years average experience"
    },
    {
        icon: Award,
        title: "Proven Track Record",
        description: "Successfully delivered 50+ mobile applications across various industries with high client satisfaction and app store ratings.",
        stats: "50+ apps delivered"
    },
    {
        icon: Clock,
        title: "On-Time Delivery",
        description: "We follow agile methodologies and project management best practices to ensure your app is delivered on schedule.",
        stats: "98% on-time delivery rate"
    },
    {
        icon: Users,
        title: "User-Centric Approach",
        description: "Every app we build focuses on exceptional user experience, intuitive design, and seamless functionality.",
        stats: "4.8+ average app rating"
    },
    {
        icon: Shield,
        title: "Security & Compliance",
        description: "We implement industry-standard security measures and ensure compliance with data protection regulations.",
        stats: "Enterprise-grade security"
    },
    {
        icon: Headphones,
        title: "Ongoing Support",
        description: "Comprehensive post-launch support including updates, maintenance, and feature enhancements.",
        stats: "24/7 technical support"
    }
]

const technologies = [
    { name: "React Native", logo: "/logos/react-native.svg" },
    { name: "Flutter", logo: "/logos/flutter.svg" },
    { name: "Swift", logo: "/logos/swift.svg" },
    { name: "Kotlin", logo: "/logos/kotlin.svg" },
    { name: "Xamarin", logo: "/logos/xamarin.svg" },
    { name: "Ionic", logo: "/logos/ionic.svg" }
]

const achievements = [
    {
        number: "50+",
        label: "Mobile Apps Delivered",
        description: "Successfully launched on App Store and Google Play"
    },
    {
        number: "98%",
        label: "Client Satisfaction",
        description: "Based on post-project client feedback surveys"
    },
    {
        number: "4.8+",
        label: "Average App Rating",
        description: "Across all apps we've developed and launched"
    },
    {
        number: "24/7",
        label: "Support Available",
        description: "Round-the-clock technical assistance and maintenance"
    }
]

export default function MobileWhyChoose() {
    return (
        <section className="bg-gray-50 py-20 dark:bg-gray-800">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                        Why Choose Us for <span className="text-blue-600 dark:text-blue-400">Mobile Development</span>
                    </h2>
                    <p className="mb-12 text-lg text-gray-600 dark:text-gray-300">
                        Partner with experienced mobile developers who understand your business needs and deliver
                        exceptional mobile applications that drive results.
                    </p>
                </motion.div>

                {/* Achievements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {achievements.map((achievement, index) => (
                        <div
                            key={index}
                            className="rounded-xl bg-white p-6 text-center shadow-sm dark:bg-gray-900"
                        >
                            <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {achievement.number}
                            </div>
                            <div className="mb-2 font-semibold text-gray-900 dark:text-white">
                                {achievement.label}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                {achievement.description}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Reasons Grid */}
                <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {reasons.map((reason, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white p-8 shadow-sm transition-all hover:shadow-lg dark:bg-gray-900"
                        >
                            <div className="mb-6 flex items-start justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-600">
                                    <reason.icon className="h-7 w-7" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                        {reason.stats}
                                    </div>
                                </div>
                            </div>

                            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                {reason.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-300">
                                {reason.description}
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
                    className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-900"
                >
                    <div className="text-center">
                        <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                            Technologies We Excel In
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            We stay up-to-date with the latest mobile development technologies and frameworks
                            to deliver cutting-edge solutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 md:grid-cols-6">
                        {technologies.map((tech, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group text-center"
                            >
                                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-50 mx-auto transition-all group-hover:bg-blue-50 dark:bg-gray-800 dark:group-hover:bg-blue-900/20">
                                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                        {tech.name.charAt(0)}
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {tech.name}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}