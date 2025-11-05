"use client"

import { motion } from "framer-motion"
import { ArrowRight, Cloud, Code, Database, Globe, Monitor, Server } from "lucide-react"

const webAppTypes = [
    {
        icon: Globe,
        title: "Progressive Web Apps (PWA)",
        description: "Modern web applications that provide native app-like experiences with offline functionality, push notifications, and app store distribution."
    },
    {
        icon: Monitor,
        title: "Single Page Applications (SPA)",
        description: "Dynamic web applications that load once and update content dynamically, providing smooth user experiences similar to desktop applications."
    },
    {
        icon: Server,
        title: "Enterprise Web Applications",
        description: "Scalable business solutions with complex workflows, user management, reporting systems, and integration with existing enterprise systems."
    },
    {
        icon: Cloud,
        title: "Cloud-Native Applications",
        description: "Applications built specifically for cloud environments with microservices architecture, auto-scaling, and distributed system capabilities."
    }
]

const technologies = [
    { name: "React.js", category: "Frontend Framework" },
    { name: "Next.js", category: "Full-Stack Framework" },
    { name: "Vue.js", category: "Frontend Framework" },
    { name: "Angular", category: "Frontend Framework" },
    { name: "Node.js", category: "Backend Runtime" },
    { name: "Python/Django", category: "Backend Framework" },
    { name: "PostgreSQL", category: "Database" },
    { name: "MongoDB", category: "Database" }
]

const features = [
    "Real-time data synchronization",
    "Advanced user authentication & authorization",
    "RESTful API & GraphQL integration",
    "Responsive design for all devices",
    "Search engine optimization (SEO)",
    "Performance optimization & caching",
    "Third-party service integrations",
    "Automated testing & CI/CD deployment"
]

export default function WebAppOverview() {
    return (
        <section className="py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-blue-50/80 sm:via-white sm:to-violet-50/60 dark:bg-gray-800 dark:sm:from-blue-950/30 dark:sm:via-gray-900 dark:sm:to-violet-950/20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
                        <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Complete Solutions</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Complete
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600"> Web Application</span> Development Solutions
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mx-auto mb-6"></div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        From progressive web apps to enterprise solutions, we build modern web applications
                        that deliver exceptional performance, scalability, and user experiences.
                    </p>
                </motion.div>

                {/* Web App Types */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
                    {webAppTypes.map((type, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group h-full"
                        >
                            <div className="h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-blue-100/50 dark:border-blue-900/30 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg mb-4 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                    <type.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                    {type.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {type.description}
                                </p>
                            </div>
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
                            Advanced Features & Capabilities
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Our web applications come equipped with modern features that enhance user experience
                            and provide robust functionality for your business needs.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                    className="flex items-center bg-blue-50/80 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100/50 dark:border-blue-800/50"
                                >
                                    <div className="mr-3 h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"></div>
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
                        className="bg-white sm:bg-gradient-to-br sm:from-violet-50/80 sm:to-blue-50/60 dark:bg-gray-900/70 dark:sm:from-violet-950/30 dark:sm:to-blue-950/20 backdrop-blur-sm border border-violet-100/50 dark:border-violet-900/30 rounded-2xl p-8 shadow-lg"
                    >
                        <div className="text-center mb-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-lg mx-auto mb-4">
                                <Database className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Technologies We Master
                            </h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                We use cutting-edge technologies to build robust, scalable web applications
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
                                    className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-900/30 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300"
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

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                        Ready to Build Your Web Application?
                    </h3>
                    <p className="mb-8 text-gray-600 dark:text-gray-300">
                        Let&apos;s discuss your web application requirements and create a solution that drives your business forward
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group inline-flex items-center rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-violet-700 hover:to-blue-700 hover:shadow-xl"
                    >
                        Get Free Consultation
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}