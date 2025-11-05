"use client"

import { motion } from "framer-motion"
import { Award, Clock, Code, HeadphonesIcon, Shield, Users } from "lucide-react"

const whyChooseReasons = [
    {
        icon: Code,
        title: "Expert Team",
        description: "Our developers have 5+ years of experience with modern web technologies including React, Next.js, Node.js, and cloud platforms.",
        stats: "50+ Projects Delivered"
    },
    {
        icon: Award,
        title: "Proven Track Record",
        description: "Successfully delivered web applications for startups to enterprise clients across various industries with 98% client satisfaction rate.",
        stats: "98% Client Satisfaction"
    },
    {
        icon: Clock,
        title: "On-Time Delivery",
        description: "We follow agile methodologies and maintain strict project timelines to ensure your web application launches when you need it.",
        stats: "95% On-Time Delivery"
    },
    {
        icon: Shield,
        title: "Security First Approach",
        description: "Enterprise-grade security measures including data encryption, secure authentication, and protection against OWASP top 10 vulnerabilities.",
        stats: "Zero Security Breaches"
    },
    {
        icon: Users,
        title: "Scalable Solutions",
        description: "Built for growth with cloud-native architecture, microservices, and auto-scaling capabilities that handle traffic spikes effortlessly.",
        stats: "99.9% Uptime"
    },
    {
        icon: HeadphonesIcon,
        title: "24/7 Support & Maintenance",
        description: "Comprehensive ongoing support with monitoring, updates, bug fixes, and feature enhancements to keep your application optimal.",
        stats: "24/7 Monitoring"
    }
]

const clientTestimonials = [
    {
        name: "Sarah Chen",
        position: "CTO, TechStart Indonesia",
        testimonial: "Genfity delivered our fintech web application ahead of schedule. Their attention to security and performance was exceptional.",
        rating: 5
    },
    {
        name: "David Rahman",
        position: "Founder, EduTech Solutions",
        testimonial: "The team built our e-learning platform with perfect mobile responsiveness. Student engagement increased by 40% after launch.",
        rating: 5
    },
    {
        name: "Lisa Wijaya",
        position: "Product Manager, RetailPro",
        testimonial: "Our e-commerce web app handles 10,000+ concurrent users flawlessly. The scalable architecture was exactly what we needed.",
        rating: 5
    }
]

const technologies = [
    "React.js", "Next.js", "Vue.js", "Angular", "Node.js", "Python", "PostgreSQL", "MongoDB",
    "AWS", "Google Cloud", "Docker", "Kubernetes", "GraphQL", "REST APIs", "TypeScript", "Tailwind CSS"
]

export default function WebAppWhyChoose() {
    return (
        <section className="bg-white sm:bg-gray-50 py-20 dark:bg-gray-800">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <h2 className="mb-6 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">
                        Why Choose Genfity for Web Application Development?
                    </h2>
                    <p className="mb-12 text-lg text-gray-600 dark:text-gray-300">
                        We combine technical expertise, proven methodologies, and client-focused approach
                        to deliver web applications that drive business success and user satisfaction.
                    </p>
                </motion.div>

                {/* Reasons Grid */}
                <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {whyChooseReasons.map((reason, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-2xl bg-white/80 dark:bg-gray-900/70 p-8 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 text-violet-600 transition-all group-hover:scale-110 dark:from-violet-900/30 dark:to-blue-900/30 dark:text-violet-400">
                                <reason.icon className="h-8 w-8" />
                            </div>
                            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                {reason.title}
                            </h3>
                            <p className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                {reason.description}
                            </p>
                            <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                {reason.stats}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Technologies Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-2xl bg-white dark:bg-gray-900/70 p-8 shadow-sm md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Technologies We Master
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            We stay current with the latest web development technologies and frameworks
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
                                className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
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
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            What Our Clients Say
                        </h3>
                        <p className="mb-12 text-gray-600 dark:text-gray-300">
                            Real feedback from businesses who chose Genfity for their web application development
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
                                className="rounded-xl bg-white dark:bg-gray-900/70 p-8 shadow-sm"
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
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Guarantee Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-16 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 p-8 text-center text-white shadow-2xl md:p-12"
                >
                    <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                        Our Quality Guarantee
                    </h3>
                    <p className="mb-8 text-violet-100">
                        We stand behind our work with comprehensive warranties and ongoing support commitments
                    </p>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <div className="mb-2 text-3xl font-bold">30 Days</div>
                            <div className="text-violet-100">Bug-free guarantee after launch</div>
                        </div>
                        <div>
                            <div className="mb-2 text-3xl font-bold">6 Months</div>
                            <div className="text-violet-100">Free maintenance and updates</div>
                        </div>
                        <div>
                            <div className="mb-2 text-3xl font-bold">Lifetime</div>
                            <div className="text-violet-100">Technical consultation support</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}