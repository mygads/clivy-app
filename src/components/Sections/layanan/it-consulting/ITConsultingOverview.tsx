"use client"

import { motion } from "framer-motion"
import {
    BarChart3,
    Cloud,
    Cog,
    Database,
    LineChart,
    Lock,
    Monitor,
    Network,
    Settings,
    Shield,
    Smartphone,
    Zap
} from "lucide-react"

const services = [
    {
        icon: BarChart3,
        title: "Digital Transformation Strategy",
        description: "Comprehensive roadmap for digitizing business processes and embracing modern technologies.",
        features: ["Strategy Development", "Technology Roadmap", "Change Management", "ROI Analysis"]
    },
    {
        icon: Cloud,
        title: "Cloud Migration & Optimization",
        description: "Seamless transition to cloud infrastructure with performance optimization and cost reduction.",
        features: ["Cloud Assessment", "Migration Planning", "Security Implementation", "Cost Optimization"]
    },
    {
        icon: Database,
        title: "IT Infrastructure Assessment",
        description: "Thorough evaluation of current IT systems to identify improvement opportunities.",
        features: ["System Audit", "Performance Analysis", "Security Review", "Upgrade Recommendations"]
    },
    {
        icon: Shield,
        title: "Cybersecurity Consulting",
        description: "Comprehensive security strategy to protect your business from digital threats.",
        features: ["Security Assessment", "Risk Management", "Compliance Planning", "Incident Response"]
    },
    {
        icon: Settings,
        title: "Business Process Optimization",
        description: "Streamline operations through technology integration and process automation.",
        features: ["Process Analysis", "Automation Solutions", "Workflow Design", "Efficiency Metrics"]
    },
    {
        icon: Monitor,
        title: "Technology Vendor Selection",
        description: "Expert guidance in choosing the right technology partners and solutions.",
        features: ["Vendor Evaluation", "RFP Development", "Solution Comparison", "Contract Negotiation"]
    }
]

const technologies = [
    { name: "Cloud Platforms", icon: Cloud },
    { name: "Data Analytics", icon: BarChart3 },
    { name: "Cybersecurity", icon: Lock },
    { name: "Network Solutions", icon: Network },
    { name: "Mobile Technology", icon: Smartphone },
    { name: "Automation Tools", icon: Cog },
    { name: "Monitoring Systems", icon: LineChart },
    { name: "Performance Optimization", icon: Zap }
]

export default function ITConsultingOverview() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-white sm:bg-gradient-to-br sm:from-white sm:via-blue-50/30 sm:to-indigo-50/40 dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-blue-950/20 dark:sm:to-indigo-950/30 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                        Comprehensive IT Consulting Services
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Transform your business with strategic IT consulting that aligns technology with your goals.
                        From digital transformation to cybersecurity, we provide expert guidance every step of the way.
                    </p>
                </motion.div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 lg:mb-20">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/70 dark:bg-gray-900/70 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 backdrop-blur-sm"
                        >
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                                <service.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Technology Expertise */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white/70 sm:bg-gradient-to-r sm:from-blue-50 sm:to-indigo-50 dark:bg-gray-900/70 dark:sm:from-gray-800 dark:sm:to-gray-700 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6 md:mb-8">
                        Technology Expertise
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {technologies.map((tech, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-gray-900/70 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <tech.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    className="text-center mt-16"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to Transform Your IT Strategy?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Let our experts assess your current IT infrastructure and create a customized roadmap for success.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Get Free IT Assessment
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}