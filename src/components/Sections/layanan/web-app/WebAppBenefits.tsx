"use client"

import { motion } from "framer-motion"
import { Award, Clock, Shield, TrendingUp, Users, Zap } from "lucide-react"

const benefits = [
    {
        icon: Zap,
        title: "Lightning Fast Performance",
        description: "Optimized code, efficient algorithms, and modern caching strategies ensure your web application loads quickly and runs smoothly.",
        color: "text-yellow-600 dark:text-yellow-400"
    },
    {
        icon: Users,
        title: "Exceptional User Experience",
        description: "Intuitive interfaces, responsive design, and seamless interactions that keep users engaged and satisfied.",
        color: "text-blue-600 dark:text-blue-400"
    },
    {
        icon: Shield,
        title: "Enterprise-Grade Security",
        description: "Advanced security measures including encryption, secure authentication, and protection against modern web threats.",
        color: "text-red-600 dark:text-red-400"
    },
    {
        icon: TrendingUp,
        title: "Scalable Architecture",
        description: "Built to grow with your business. Our applications handle increased traffic and data seamlessly as you expand.",
        color: "text-green-600 dark:text-green-400"
    },
    {
        icon: Clock,
        title: "Real-Time Capabilities",
        description: "Live data updates, instant messaging, real-time notifications, and collaborative features that keep users connected.",
        color: "text-purple-600 dark:text-purple-400"
    },
    {
        icon: Award,
        title: "SEO & Performance Optimized",
        description: "Search engine friendly code, optimized loading speeds, and performance metrics that drive organic traffic growth.",
        color: "text-emerald-600 dark:text-emerald-400"
    }
]

const statistics = [
    { value: "50%", label: "Faster Load Times", description: "Compared to average web apps" },
    { value: "99.9%", label: "Uptime Guarantee", description: "Reliable hosting & infrastructure" },
    { value: "100%", label: "Mobile Responsive", description: "Perfect on all devices" },
    { value: "24/7", label: "Support Available", description: "Expert technical assistance" }
]

export default function WebAppBenefits() {
    return (
        <section className="py-20 px-4 bg-white sm:bg-gradient-to-br sm:from-violet-50/80 sm:via-white sm:to-blue-50/60 dark:bg-gray-800 dark:sm:from-violet-950/30 dark:sm:via-gray-900 dark:sm:to-blue-950/20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100/80 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 mb-6">
                        <Award className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Why Choose Us</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Why Choose Our
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600"> Web Application</span> Development?
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full mx-auto mb-6"></div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        Our web applications deliver measurable business value through innovative technology,
                        expert development practices, and user-centered design principles.
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group h-full"
                        >
                            <div className="h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-900/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-lg mb-6 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                    <benefit.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Statistics Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl"
                >
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            Proven Results & Performance
                        </h3>
                        <p className="text-violet-100 text-lg">
                            Our web applications consistently deliver exceptional performance metrics and user satisfaction
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {statistics.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-lg font-semibold text-violet-100 mb-1">
                                    {stat.label}
                                </div>
                                <div className="text-sm text-violet-200">
                                    {stat.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Additional Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                        Additional Value We Provide
                    </h3>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-900/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Future-Proof Technology
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300">
                                Built with modern frameworks and best practices that ensure your application remains current and maintainable.
                            </p>
                        </div>
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-900/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Cost-Effective Solutions
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300">
                                Efficient development processes and reusable components reduce costs while maintaining high quality standards.
                            </p>
                        </div>
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-900/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Ongoing Support
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300">
                                Comprehensive maintenance, updates, and technical support to keep your application running optimally.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}