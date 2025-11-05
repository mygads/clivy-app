"use client"

import { motion } from "framer-motion"
import {
    Award,
    Users,
    Star,
    TrendingUp,
    Shield,
    Clock,
    CheckCircle,
    Quote,
    Building,
    Zap
} from "lucide-react"

const whyChooseUs = [
    {
        icon: Award,
        title: "15+ Years of Expertise",
        description: "Extensive experience in enterprise IT consulting across diverse industries and technologies.",
        highlight: "Industry veteran consultants"
    },
    {
        icon: Users,
        title: "Certified Professionals",
        description: "Team of certified experts with advanced credentials in major technology platforms.",
        highlight: "50+ industry certifications"
    },
    {
        icon: TrendingUp,
        title: "Proven Results",
        description: "Track record of delivering measurable business outcomes and ROI for our clients.",
        highlight: "85% success rate"
    },
    {
        icon: Shield,
        title: "Enterprise Security Focus",
        description: "Deep expertise in cybersecurity and compliance frameworks for enterprise environments.",
        highlight: "Zero security incidents"
    },
    {
        icon: Zap,
        title: "Rapid Implementation",
        description: "Accelerated deployment strategies that minimize downtime and maximize business continuity.",
        highlight: "50% faster delivery"
    },
    {
        icon: Clock,
        title: "24/7 Support",
        description: "Round-the-clock support and monitoring to ensure optimal system performance.",
        highlight: "Always available"
    }
]

const testimonials = [
    {
        name: "Sarah Johnson",
        position: "CTO",
        company: "TechCorp Industries",
        content: "Genfity&apos;s IT consulting transformed our entire infrastructure. Their strategic approach reduced our operational costs by 40% while improving system performance dramatically.",
        rating: 5,
        avatar: "/images/testimonials/sarah.jpg"
    },
    {
        name: "Michael Chen",
        position: "IT Director",
        company: "Global Manufacturing",
        content: "The digital transformation roadmap they created was exactly what we needed. Implementation was smooth, and the results exceeded our expectations.",
        rating: 5,
        avatar: "/images/testimonials/michael.jpg"
    },
    {
        name: "Lisa Rodriguez",
        position: "CEO",
        company: "FinanceFirst",
        content: "Outstanding cybersecurity consulting. They helped us achieve 100% compliance with industry regulations while strengthening our security posture significantly.",
        rating: 5,
        avatar: "/images/testimonials/lisa.jpg"
    }
]

const partnerships = [
    {
        name: "Microsoft",
        logo: "/images/partners/microsoft.png",
        level: "Gold Partner"
    },
    {
        name: "AWS",
        logo: "/images/partners/aws.png",
        level: "Advanced Partner"
    },
    {
        name: "Google Cloud",
        logo: "/images/partners/google.png",
        level: "Premier Partner"
    },
    {
        name: "Cisco",
        logo: "/images/partners/cisco.png",
        level: "Select Partner"
    },
    {
        name: "VMware",
        logo: "/images/partners/vmware.png",
        level: "Professional Partner"
    },
    {
        name: "Oracle",
        logo: "/images/partners/oracle.png",
        level: "Platinum Partner"
    }
]

const achievements = [
    {
        number: "200+",
        label: "Successful Projects",
        description: "Delivered across various industries"
    },
    {
        number: "98%",
        label: "Client Satisfaction",
        description: "Based on project completion surveys"
    },
    {
        number: "15+",
        label: "Years Experience",
        description: "In enterprise IT consulting"
    },
    {
        number: "24/7",
        label: "Support Available",
        description: "Round-the-clock expert assistance"
    }
]

export default function ITConsultingWhyChoose() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-white sm:bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
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
                        Why Choose Genfity for IT Consulting?
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Partner with the IT consulting experts who deliver strategic value, measurable results, and long-term success for your business.
                    </p>
                </motion.div>

                {/* Why Choose Us Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 lg:mb-20">
                    {whyChooseUs.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/70 dark:bg-gray-900/70 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                        >
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                                <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                {item.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {item.description}
                            </p>

                            <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {item.highlight}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Achievements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 mb-16 lg:mb-20"
                >
                    <h3 className="text-2xl font-bold text-white text-center mb-8">
                        Our Track Record
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {achievement.number}
                                </div>
                                <div className="text-blue-100 font-semibold mb-1">
                                    {achievement.label}
                                </div>
                                <div className="text-blue-200 text-sm">
                                    {achievement.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Client Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 lg:mb-20"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-8 md:mb-12">
                        What Our Clients Say
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/70 dark:bg-gray-900/70 rounded-xl p-4 md:p-6 shadow-lg relative backdrop-blur-sm"
                            >
                                <Quote className="h-8 w-8 text-blue-300 dark:text-blue-600 mb-4" />

                                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                                    {testimonial.content}
                                </p>

                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                                    ))}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                        <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {testimonial.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {testimonial.position}, {testimonial.company}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Technology Partnerships */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-8"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Trusted Technology Partnerships
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {partnerships.map((partner, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center group"
                            >
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-all duration-300">
                                    <Building className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                    {partner.name}
                                </h4>
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    {partner.level}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to Experience the Genfity Advantage?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join hundreds of successful businesses that trust Genfity for their IT consulting needs.
                        Let&apos;s discuss how we can transform your technology landscape.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Start Your Consulting Journey
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}