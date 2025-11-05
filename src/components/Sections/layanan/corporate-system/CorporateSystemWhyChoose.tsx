"use client"

import { motion } from "framer-motion"
import { Award, Clock, Database, HeadphonesIcon, Shield, Users } from "lucide-react"

const whyChooseReasons = [
    {
        icon: Database,
        title: "Enterprise System Expertise",
        description: "Over 8 years of experience building enterprise-grade corporate systems for companies ranging from startups to Fortune 500 organizations.",
        stats: "75+ Systems Delivered"
    },
    {
        icon: Award,
        title: "Industry Recognition",
        description: "Certified enterprise architects and developers with proven track record in delivering complex corporate systems that drive business transformation.",
        stats: "99% Success Rate"
    },
    {
        icon: Clock,
        title: "On-Time Enterprise Delivery",
        description: "Rigorous project management and agile methodologies ensure your corporate system is delivered on schedule with zero compromise on quality.",
        stats: "98% On-Time Delivery"
    },
    {
        icon: Shield,
        title: "Enterprise Security Standards",
        description: "Bank-level security implementation with ISO 27001 compliance, end-to-end encryption, and comprehensive audit trails for enterprise peace of mind.",
        stats: "Zero Security Incidents"
    },
    {
        icon: Users,
        title: "Scalable Enterprise Architecture",
        description: "Future-proof system architecture designed to scale from hundreds to millions of users with cloud-native technologies and microservices design.",
        stats: "10M+ Users Supported"
    },
    {
        icon: HeadphonesIcon,
        title: "Enterprise Support & SLA",
        description: "Dedicated enterprise support team with guaranteed SLA, 24/7 monitoring, and proactive maintenance to ensure business continuity.",
        stats: "99.9% Uptime SLA"
    }
]

const clientTestimonials = [
    {
        name: "Michael Anderson",
        position: "CTO, GlobalTech Industries",
        company: "Fortune 500 Manufacturing",
        testimonial: "Genfity delivered our ERP system that handles 50,000+ employees across 15 countries. The system improved our operational efficiency by 45%.",
        rating: 5
    },
    {
        name: "Dr. Sarah Williams",
        position: "IT Director, HealthCare Plus",
        company: "Healthcare Network",
        testimonial: "Our patient management system processes 100,000+ patient records daily. The HIPAA-compliant solution exceeded all our security requirements.",
        rating: 5
    },
    {
        name: "Robert Chen",
        position: "VP Operations, FinanceGlobal",
        company: "Financial Services",
        testimonial: "The risk management system integrated seamlessly with our existing infrastructure. ROI was achieved within 8 months of deployment.",
        rating: 5
    }
]

const technologies = [
    "Java Spring Boot", ".NET Core", "Python Django", "Node.js", "PostgreSQL", "Oracle DB", "MongoDB", "Redis",
    "AWS", "Microsoft Azure", "Google Cloud", "Kubernetes", "Docker", "Microservices", "Apache Kafka", "RabbitMQ"
]

const certifications = [
    {
        name: "ISO 27001",
        description: "Information Security Management"
    },
    {
        name: "SOC 2 Type II",
        description: "Security & Availability Controls"
    },
    {
        name: "GDPR Compliant",
        description: "Data Protection Regulation"
    },
    {
        name: "HIPAA Certified",
        description: "Healthcare Data Security"
    }
]

export default function CorporateSystemWhyChoose() {
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
                        Why Choose Genfity for Corporate System Development?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                        We combine enterprise-grade expertise, proven methodologies, and cutting-edge technology
                        to deliver corporate systems that transform business operations and drive sustainable growth.
                    </p>
                </motion.div>

                {/* Reasons Grid */}
                <div className="mb-12 sm:mb-16 grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {whyChooseReasons.map((reason, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 shadow-sm transition-all hover:shadow-xl"
                        >
                            <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 transition-all group-hover:scale-110 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-400">
                                <reason.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                {reason.title}
                            </h3>
                            <p className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                {reason.description}
                            </p>
                            <div className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                {reason.stats}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Certifications Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-900 md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Industry Certifications & Compliance
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Our enterprise systems meet the highest industry standards and regulatory requirements
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {certifications.map((cert, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-gray-50 p-6 text-center dark:bg-gray-800"
                            >
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h4 className="mb-2 font-bold text-gray-900 dark:text-white">
                                    {cert.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {cert.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Technologies Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 p-8 dark:from-gray-800 dark:to-purple-900/20 md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Enterprise Technologies We Master
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            We leverage proven enterprise technologies and cloud platforms for robust, scalable systems
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {technologies.map((tech, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm dark:bg-gray-700 dark:text-gray-300"
                            >
                                {tech}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>

                {/* Client Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Enterprise Client Success Stories
                        </h3>
                        <p className="mb-12 text-gray-600 dark:text-gray-300">
                            Hear from enterprise clients who transformed their operations with our corporate systems
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {clientTestimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900"
                            >
                                <div className="mb-4 flex text-yellow-400">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <blockquote className="mb-4 text-gray-600 dark:text-gray-300">
                                    &quot;{testimonial.testimonial}&quot;
                                </blockquote>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {testimonial.position}
                                    </div>
                                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                        {testimonial.company}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Enterprise Guarantee Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-700 to-indigo-600 p-8 text-center text-white shadow-2xl md:p-12"
                >
                    <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                        Enterprise Guarantee & SLA
                    </h3>
                    <p className="mb-8 text-purple-100">
                        We back our corporate systems with comprehensive enterprise-grade guarantees and service level agreements
                    </p>
                    <div className="grid gap-6 md:grid-cols-4">
                        <div>
                            <div className="mb-2 text-3xl font-bold">99.9%</div>
                            <div className="text-purple-100">Uptime SLA guarantee</div>
                        </div>
                        <div>
                            <div className="mb-2 text-3xl font-bold">12 Months</div>
                            <div className="text-purple-100">Free maintenance & updates</div>
                        </div>
                        <div>
                            <div className="mb-2 text-3xl font-bold">24/7</div>
                            <div className="text-purple-100">Enterprise support availability</div>
                        </div>
                        <div>
                            <div className="mb-2 text-3xl font-bold">Lifetime</div>
                            <div className="text-purple-100">Architecture consultation support</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}