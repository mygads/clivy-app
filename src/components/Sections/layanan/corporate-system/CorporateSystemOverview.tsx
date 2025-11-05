"use client"

import { motion } from "framer-motion"
import { ArrowRight, BarChart3, Building, Database, DollarSign, FileText, Settings, Shield, Users } from "lucide-react"

const systemTypes = [
    {
        icon: Building,
        title: "Enterprise Resource Planning (ERP)",
        description: "Comprehensive business management systems that integrate all core business processes including finance, HR, procurement, and operations."
    },
    {
        icon: Users,
        title: "Customer Relationship Management (CRM)",
        description: "Advanced CRM systems for managing customer interactions, sales pipelines, marketing campaigns, and customer service operations."
    },
    {
        icon: FileText,
        title: "Human Resource Management (HRM)",
        description: "Complete HR solutions covering employee management, payroll, attendance, performance evaluation, and recruitment processes."
    },
    {
        icon: BarChart3,
        title: "Business Intelligence & Analytics",
        description: "Data-driven systems providing real-time insights, reporting dashboards, and analytics for informed business decision making."
    }
]

const technologies = [
    { name: "Java Spring Boot", category: "Backend Framework" },
    { name: ".NET Core", category: "Backend Framework" },
    { name: "Python Django", category: "Backend Framework" },
    { name: "Node.js", category: "Backend Runtime" },
    { name: "PostgreSQL", category: "Database" },
    { name: "MySQL", category: "Database" },
    { name: "MongoDB", category: "NoSQL Database" },
    { name: "Redis", category: "Cache Database" }
]

const features = [
    "Multi-tenant architecture support",
    "Role-based access control & permissions",
    "Real-time data synchronization",
    "Advanced reporting & analytics",
    "API integration capabilities",
    "Workflow automation engine",
    "Document management system",
    "Audit trails & compliance tracking"
]

export default function CorporateSystemOverview() {
    return (
        <section className="bg-white py-16 sm:py-20 md:py-24 lg:py-32 sm:bg-gradient-to-br sm:from-indigo-50 sm:to-purple-50 dark:bg-gray-900 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-indigo-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl text-center mb-8 sm:mb-12 md:mb-16"
                >
                    <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                        Complete Corporate System Development Solutions
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                        From ERP to CRM, we build comprehensive corporate management systems
                        that streamline operations, enhance productivity, and drive business growth.
                    </p>
                </motion.div>

                {/* System Types */}
                <div className="mb-12 sm:mb-16 grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {systemTypes.map((type, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 transition-all hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-600"
                        >
                            <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 transition-all group-hover:from-indigo-600 group-hover:to-purple-700 group-hover:text-white dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-400">
                                <type.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                {type.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                {type.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Features & Technologies Section */}
                <div className="grid gap-12 lg:grid-cols-2">
                    {/* Features */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                            Enterprise Features & Capabilities
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Our corporate systems come equipped with enterprise-grade features
                            that scale with your business and adapt to changing requirements.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                    className="flex items-center rounded-lg bg-purple-50 p-3 dark:bg-purple-900/10"
                                >
                                    <div className="mr-3 h-2 w-2 rounded-full bg-purple-500"></div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {feature}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Technologies */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8 backdrop-blur-sm dark:from-indigo-900/20 dark:to-purple-900/20"
                    >
                        <div className="mb-6 text-center">
                            <Settings className="mx-auto mb-4 h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Enterprise Technologies
                            </h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                We leverage proven enterprise technologies for robust, scalable systems
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {technologies.map((tech, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                    className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700"
                                >
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {tech.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {tech.category}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Value Proposition */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-700 to-indigo-600 p-8 text-white shadow-2xl md:p-12"
                >
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="text-center">
                            <Shield className="mx-auto mb-4 h-12 w-12 text-white" />
                            <h4 className="mb-2 text-xl font-bold">Enterprise Security</h4>
                            <p className="text-purple-100">
                                Bank-level security with encryption, audit trails, and compliance standards
                            </p>
                        </div>
                        <div className="text-center">
                            <DollarSign className="mx-auto mb-4 h-12 w-12 text-white" />
                            <h4 className="mb-2 text-xl font-bold">Cost Efficiency</h4>
                            <p className="text-purple-100">
                                Reduce operational costs by up to 40% through process automation
                            </p>
                        </div>
                        <div className="text-center">
                            <Database className="mx-auto mb-4 h-12 w-12 text-white" />
                            <h4 className="mb-2 text-xl font-bold">Scalable Architecture</h4>
                            <p className="text-purple-100">
                                Systems that grow with your business from startup to enterprise scale
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                        Ready to Transform Your Business Operations?
                    </h3>
                    <p className="mb-8 text-gray-600 dark:text-gray-300">
                        Let&apos;s discuss your corporate system requirements and design a solution that drives efficiency
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-800 hover:shadow-xl"
                    >
                        Get Free Consultation
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}