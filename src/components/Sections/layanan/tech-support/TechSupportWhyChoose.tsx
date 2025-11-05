"use client"

import { motion } from "framer-motion"
import {
    Award,
    Clock,
    Shield,
    Users,
    Star,
    TrendingUp,
    CheckCircle,
    Quote,
    Building,
    Headphones,
    Zap,
    Phone
} from "lucide-react"

const whyChooseUs = [
    {
        icon: Clock,
        title: "Lightning-Fast Response",
        description: "Industry-leading response times with guaranteed SLA commitments for all priority levels.",
        highlight: "<30 minutes average response"
    },
    {
        icon: Award,
        title: "Certified Technicians",
        description: "Team of certified professionals with extensive experience across all major technologies.",
        highlight: "100+ industry certifications"
    },
    {
        icon: Shield,
        title: "24/7 Availability",
        description: "Round-the-clock support availability for critical issues and emergency situations.",
        highlight: "Always accessible"
    },
    {
        icon: TrendingUp,
        title: "High Resolution Rate",
        description: "Exceptional first-call resolution rate with comprehensive problem-solving approach.",
        highlight: "95% first-call resolution"
    },
    {
        icon: Users,
        title: "Dedicated Support Team",
        description: "Assigned support specialists who understand your specific systems and requirements.",
        highlight: "Personal tech specialists"
    },
    {
        icon: Zap,
        title: "Proactive Monitoring",
        description: "Advanced monitoring systems that detect and resolve issues before they impact your business.",
        highlight: "Prevents 90% of issues"
    }
]

const testimonials = [
    {
        name: "David Kim",
        position: "IT Manager",
        company: "TechStart Solutions",
        content: "Genfity&apos;s technical support has been a lifesaver for our growing business. Their response time is incredible, and they always resolve our issues quickly and professionally.",
        rating: 5,
        avatar: "/images/testimonials/david.jpg"
    },
    {
        name: "Maria Santos",
        position: "Operations Director",
        company: "Global Logistics Inc",
        content: "The proactive monitoring service has prevented so many potential problems. We haven&apos;t had any significant downtime since partnering with Genfity for technical support.",
        rating: 5,
        avatar: "/images/testimonials/maria.jpg"
    },
    {
        name: "James Wilson",
        position: "Small Business Owner",
        company: "Wilson & Associates",
        content: "As a small business, having reliable technical support is crucial. Genfity provides enterprise-level support at a price that works for us. Highly recommended!",
        rating: 5,
        avatar: "/images/testimonials/james.jpg"
    }
]

const serviceStats = [
    {
        number: "99.9%",
        label: "Uptime Guarantee",
        description: "For monitored systems"
    },
    {
        number: "<30min",
        label: "Average Response",
        description: "For all support requests"
    },
    {
        number: "95%",
        label: "First Call Resolution",
        description: "Issues resolved immediately"
    },
    {
        number: "500+",
        label: "Happy Clients",
        description: "Businesses we support"
    }
]

const certifications = [
    {
        name: "Microsoft",
        certification: "Certified Systems Administrator",
        logo: "/images/certs/microsoft.png"
    },
    {
        name: "Cisco",
        certification: "Certified Network Associate",
        logo: "/images/certs/cisco.png"
    },
    {
        name: "CompTIA",
        certification: "A+ Certified Technician",
        logo: "/images/certs/comptia.png"
    },
    {
        name: "VMware",
        certification: "Certified Professional",
        logo: "/images/certs/vmware.png"
    },
    {
        name: "Amazon",
        certification: "AWS Certified Solutions Architect",
        logo: "/images/certs/aws.png"
    },
    {
        name: "Google",
        certification: "Cloud Certified Engineer",
        logo: "/images/certs/google.png"
    }
]

const supportAgreements = [
    {
        title: "Response Time SLA",
        commitment: "Guaranteed response within defined time frames",
        details: ["Critical: 15 minutes", "High: 30 minutes", "Medium: 2 hours", "Low: 24 hours"]
    },
    {
        title: "Resolution Time SLA",
        commitment: "Target resolution times for different issue types",
        details: ["Critical: 4 hours", "High: 1 business day", "Medium: 3 business days", "Low: 5 business days"]
    },
    {
        title: "Availability SLA",
        commitment: "Guaranteed support availability and system uptime",
        details: ["24/7 critical support", "99.9% uptime monitoring", "Emergency response team", "Backup support coverage"]
    }
]

export default function TechSupportWhyChoose() {
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
                        Why Choose Genfity Technical Support?
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Experience the difference with professional technical support that prioritizes your business continuity and success.
                    </p>
                </motion.div>

                {/* Why Choose Us Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
                    {whyChooseUs.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-center w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg mb-4">
                                <item.icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                {item.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {item.description}
                            </p>

                            <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                                <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                                    {item.highlight}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Service Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-16 sm:mb-20 border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8">
                        Our Performance Metrics
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                        {serviceStats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-900 dark:text-white font-semibold mb-1 text-sm sm:text-base">
                                    {stat.label}
                                </div>
                                <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                                    {stat.description}
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
                    className="mb-16 sm:mb-20"
                >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-8 sm:mb-12">
                        What Our Clients Say
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg relative border border-gray-100 dark:border-gray-700"
                            >
                                <Quote className="h-8 w-8 text-teal-300 dark:text-teal-600 mb-4" />

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

                {/* Professional Certifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-20"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Professional Certifications
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {certifications.map((cert, index) => (
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
                                    {cert.name}
                                </h4>
                                <p className="text-xs text-teal-600 dark:text-teal-400">
                                    {cert.certification}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Service Level Agreements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
                        Service Level Agreements
                    </h3>

                    <div className="grid md:grid-cols-3 gap-8">
                        {supportAgreements.map((sla, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg"
                            >
                                <div className="flex items-center justify-center w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg mx-auto mb-4">
                                    <CheckCircle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                </div>

                                <h4 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-3">
                                    {sla.title}
                                </h4>

                                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                                    {sla.commitment}
                                </p>

                                <ul className="space-y-2">
                                    {sla.details.map((detail, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
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
                    className="text-center"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to Experience Premium Technical Support?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join hundreds of businesses that trust Genfity for reliable, professional technical support services.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Start Your Support Plan Today
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}