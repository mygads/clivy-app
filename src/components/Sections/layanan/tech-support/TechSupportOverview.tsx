"use client"

import { motion } from "framer-motion"
import {
    Headphones,
    Monitor,
    Wifi,
    HardDrive,
    Shield,
    Wrench,
    Cloud,
    Smartphone,
    Network,
    Lock,
    AlertTriangle,
    CheckCircle
} from "lucide-react"

const services = [
    {
        icon: Monitor,
        title: "Hardware Support",
        description: "Complete hardware troubleshooting, repair, and maintenance for all your devices.",
        features: ["Desktop & Laptop Repair", "Server Maintenance", "Peripheral Setup", "Hardware Upgrades"]
    },
    {
        icon: Network,
        title: "Network Support",
        description: "Network infrastructure setup, troubleshooting, and optimization services.",
        features: ["Network Configuration", "Wi-Fi Setup", "Security Implementation", "Performance Optimization"]
    },
    {
        icon: Cloud,
        title: "Software Support",
        description: "Software installation, configuration, and troubleshooting assistance.",
        features: ["OS Installation", "Application Setup", "License Management", "Update Management"]
    },
    {
        icon: Shield,
        title: "Security Support",
        description: "Comprehensive cybersecurity support and threat response services.",
        features: ["Antivirus Setup", "Firewall Configuration", "Security Audits", "Incident Response"]
    },
    {
        icon: HardDrive,
        title: "Data Recovery",
        description: "Professional data recovery and backup solution implementation.",
        features: ["Data Recovery Services", "Backup Setup", "Data Migration", "Storage Solutions"]
    },
    {
        icon: Smartphone,
        title: "Mobile Device Support",
        description: "Complete mobile device management and troubleshooting services.",
        features: ["Mobile Setup", "App Installation", "Sync Configuration", "Security Setup"]
    }
]

const supportChannels = [
    {
        name: "Phone Support",
        description: "Direct phone assistance",
        icon: Headphones,
        availability: "24/7"
    },
    {
        name: "Remote Support",
        description: "Screen sharing assistance",
        icon: Monitor,
        availability: "Business Hours"
    },
    {
        name: "On-Site Support",
        description: "Technician visits",
        icon: Wrench,
        availability: "Scheduled"
    },
    {
        name: "Email Support",
        description: "Email ticket system",
        icon: AlertTriangle,
        availability: "24/7"
    }
]

const technologies = [
    { name: "Windows Support", icon: Monitor },
    { name: "macOS Support", icon: Monitor },
    { name: "Linux Support", icon: Monitor },
    { name: "Network Security", icon: Lock },
    { name: "Cloud Services", icon: Cloud },
    { name: "Mobile Devices", icon: Smartphone },
    { name: "Server Systems", icon: HardDrive },
    { name: "Wi-Fi Networks", icon: Wifi }
]

export default function TechSupportOverview() {
    return (
        <section className="py-12 sm:py-16 md:py-20 bg-white sm:bg-gradient-to-br sm:from-white sm:via-teal-50/30 sm:to-white dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-teal-900/20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                        Comprehensive Technical Support Services
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        From hardware issues to software problems, our certified technicians provide expert support
                        across all your technology needs. Get fast, reliable solutions that keep your business running.
                    </p>
                </motion.div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-center w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg mb-4">
                                <service.icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                {service.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {service.description}
                            </p>

                            <ul className="space-y-2">
                                {service.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Support Channels */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-16 sm:mb-20 border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8">
                        Multiple Support Channels
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {supportChannels.map((channel, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center shadow-lg border border-gray-100 dark:border-gray-700"
                            >
                                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <channel.icon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {channel.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    {channel.description}
                                </p>
                                <span className="inline-block px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-xs font-medium">
                                    {channel.availability}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Technology Expertise */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8">
                        Technology Expertise
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {technologies.map((tech, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                                    <tech.icon className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600 dark:text-teal-400" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {tech.name}
                                </span>
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
                    className="text-center"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Need Technical Support Right Now?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Our support team is ready to help you resolve any technical issues quickly and efficiently.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Get Emergency Support
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300"
                        >
                            Schedule Support
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}