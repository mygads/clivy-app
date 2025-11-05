"use client"

import { motion } from "framer-motion"
import { Award, BarChart3, Globe, MessageSquare, Send, Shield, Star, TrendingUp, Users, Zap } from "lucide-react"

const advantages = [
    {
        icon: Send,
        title: "Industry-Leading Delivery",
        description: "Achieve 98% message delivery rates with our optimized infrastructure and WhatsApp Business partnerships.",
        highlight: "98% Delivery Rate"
    },
    {
        icon: Zap,
        title: "Lightning-Fast Broadcasting",
        description: "Send up to 100,000 messages per hour with our high-performance campaign deployment system.",
        highlight: "100K/hour Capacity"
    },
    {
        icon: Shield,
        title: "Compliance & Security",
        description: "Full GDPR compliance and enterprise-grade security for protecting customer data and privacy.",
        highlight: "GDPR Compliant"
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description: "Real-time campaign insights with detailed performance metrics and ROI tracking capabilities.",
        highlight: "Real-time Analytics"
    },
    {
        icon: Globe,
        title: "Global Reach",
        description: "Worldwide message delivery with local optimization for 180+ countries and regions.",
        highlight: "180+ Countries"
    },
    {
        icon: Users,
        title: "Expert Support Team",
        description: "Dedicated campaign specialists available 24/7 to optimize your broadcast performance.",
        highlight: "24/7 Expert Support"
    }
]

const testimonials = [
    {
        company: "FashionForward Store",
        industry: "E-commerce",
        logo: "👗",
        testimonial: "WhatsApp broadcast campaigns increased our flash sale conversions by 350%. The targeting features are incredibly powerful.",
        author: "Lisa Wang",
        position: "Marketing Director",
        metrics: {
            conversion: "+350%",
            engagement: "+280%",
            revenue: "+400%"
        }
    },
    {
        company: "Tasty Bites Restaurant",
        industry: "Food & Beverage",
        logo: "🍕",
        testimonial: "Our daily menu broadcasts reach 10,000+ customers instantly. Order volume increased by 180% since we started using Genfity.",
        author: "Chef Marco Rodriguez",
        position: "Owner",
        metrics: {
            orders: "+180%",
            reach: "10K+ daily",
            retention: "+65%"
        }
    },
    {
        company: "PropMaster Realty",
        industry: "Real Estate",
        logo: "🏢",
        testimonial: "Property listing broadcasts generate 5x more inquiries than email. Our agents love the instant engagement from prospects.",
        author: "David Chen",
        position: "Sales Manager",
        metrics: {
            inquiries: "5x more",
            viewings: "+220%",
            sales: "+140%"
        }
    }
]

const performanceMetrics = [
    {
        metric: "Message Delivery Speed",
        genfity: "<30 seconds",
        industry: "2-5 minutes",
        advantage: "10x faster"
    },
    {
        metric: "Campaign Setup Time",
        genfity: "5 minutes",
        industry: "30-60 minutes",
        advantage: "12x faster"
    },
    {
        metric: "Delivery Success Rate",
        genfity: "98.5%",
        industry: "85-90%",
        advantage: "10% higher"
    },
    {
        metric: "Support Response Time",
        genfity: "<2 hours",
        industry: "24-48 hours",
        advantage: "24x faster"
    },
    {
        metric: "Campaign Analytics",
        genfity: "Real-time",
        industry: "24-48h delay",
        advantage: "Instant insights"
    }
]

const successStories = [
    {
        title: "Black Friday Campaign Success",
        client: "Electronics Mega Store",
        result: "5M IDR revenue in 2 hours",
        details: "Sent 50,000 flash sale notifications, achieved 45% open rate and 12% conversion",
        icon: "🛍️"
    },
    {
        title: "Product Launch Excellence",
        client: "Beauty Brand Indonesia",
        result: "1000 pre-orders in 30 minutes",
        details: "Exclusive product announcement to VIP customers with limited quantity offer",
        icon: "💄"
    },
    {
        title: "Event Promotion Triumph",
        client: "Jakarta Convention Center",
        result: "2500 ticket sales boost",
        details: "Last-minute event promotion with targeted audience segmentation",
        icon: "🎫"
    }
]

const certifications = [
    {
        name: "WhatsApp BSP",
        description: "Official Business Solution Provider",
        icon: "✅",
        year: "2024"
    },
    {
        name: "ISO 27001",
        description: "Information Security Standard",
        icon: "🔒",
        year: "2023"
    },
    {
        name: "GDPR Certified",
        description: "Data Protection Compliance",
        icon: "🇪🇺",
        year: "2023"
    },
    {
        name: "SOC 2 Type II",
        description: "Security & Availability",
        icon: "🛡️",
        year: "2024"
    }
]

const awards = [
    {
        title: "Best WhatsApp Marketing Platform 2024",
        organization: "Indonesia Digital Marketing Awards",
        year: "2024",
        icon: "🏆"
    },
    {
        title: "Excellence in Customer Engagement",
        organization: "Southeast Asia Tech Awards",
        year: "2024",
        icon: "🌟"
    },
    {
        title: "Top Broadcast Solution Provider",
        organization: "ASEAN Business Excellence",
        year: "2023",
        icon: "🎖️"
    }
]

const clientLogos = [
    { name: "FashionForward", logo: "👗" },
    { name: "TastyBites", logo: "🍕" },
    { name: "PropMaster", logo: "🏢" },
    { name: "ElectroMega", logo: "📱" },
    { name: "BeautyBrand", logo: "💄" },
    { name: "HealthPlus", logo: "🏥" }
]

export default function WhatsAppBroadcastWhyChoose() {
    return (
        <section className="bg-white sm:bg-gradient-to-br sm:from-white sm:via-orange-50/30 sm:to-white py-12 sm:py-16 md:py-20 dark:bg-gray-900 dark:sm:from-gray-900 dark:sm:via-orange-900/10 dark:sm:to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-4xl text-center"
                >
                    <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                        Why Choose Genfity Broadcast?
                    </h2>
                    <p className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Join 2000+ businesses who trust Genfity for their WhatsApp marketing campaigns.
                        Experience superior delivery rates, advanced targeting, and exceptional campaign performance.
                    </p>
                </motion.div>

                {/* Key Advantages */}
                <div className="mb-12 sm:mb-16 grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {advantages.map((advantage, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 shadow-sm transition-all hover:shadow-xl"
                        >
                            <div className="mb-3 sm:mb-4 flex items-center justify-between">
                                <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-orange-100/70 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 transition-all group-hover:scale-110">
                                    <advantage.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                                </div>
                                <span className="rounded-full bg-orange-100/70 dark:bg-orange-900/30 px-2 sm:px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                                    {advantage.highlight}
                                </span>
                            </div>
                            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                {advantage.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                {advantage.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Client Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-8 sm:mb-10 md:mb-12 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Success Stories from Our Clients
                        </h3>
                    </div>

                    <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 shadow-sm"
                            >
                                <div className="mb-4 sm:mb-6">
                                    <div className="mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4">
                                        <div className="text-2xl sm:text-3xl md:text-4xl">{testimonial.logo}</div>
                                        <div>
                                            <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                                {testimonial.company}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">
                                                {testimonial.industry}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mb-3 sm:mb-4 flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <blockquote className="mb-4 sm:mb-6 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 italic leading-relaxed">
                                        &ldquo;{testimonial.testimonial}&rdquo;
                                    </blockquote>
                                </div>

                                <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-gray-200/50 dark:border-gray-700/50 pt-4 sm:pt-6">
                                    {Object.entries(testimonial.metrics).map(([key, value], idx) => (
                                        <div key={idx} className="text-center">
                                            <div className="text-sm sm:text-base md:text-lg font-bold text-orange-600 dark:text-orange-400">
                                                {value}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {key}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-100/70 dark:bg-orange-900/30 flex items-center justify-center">
                                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                            {testimonial.author}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-300">
                                            {testimonial.position}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Performance Comparison */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 md:p-12 shadow-sm"
                >
                    <div className="text-center">
                        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Outperforming Industry Standards
                        </h3>
                        <p className="mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                            See how Genfity&apos;s broadcast platform delivers superior performance across key metrics
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm">
                            <thead>
                                <tr className="border-b border-gray-200/50 dark:border-gray-600/50">
                                    <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Performance Metric</th>
                                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Genfity</th>
                                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Industry Average</th>
                                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Our Advantage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performanceMetrics.map((metric, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="border-b border-gray-100/50 dark:border-gray-600/50"
                                    >
                                        <td className="p-3 sm:p-4 text-sm sm:text-base font-medium text-gray-900 dark:text-white">{metric.metric}</td>
                                        <td className="p-3 sm:p-4 text-center">
                                            <span className="rounded-full bg-green-100/70 dark:bg-green-900/30 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                                                {metric.genfity}
                                            </span>
                                        </td>
                                        <td className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">{metric.industry}</td>
                                        <td className="p-3 sm:p-4 text-center">
                                            <span className="rounded-full bg-orange-100/70 dark:bg-orange-900/30 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                {metric.advantage}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Success Stories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-8 sm:mb-10 md:mb-12 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Campaign Success Highlights
                        </h3>
                    </div>

                    <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                        {successStories.map((story, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
                            >
                                <div className="mb-4 text-3xl">{story.icon}</div>
                                <h4 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                                    {story.title}
                                </h4>
                                <div className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {story.client}
                                </div>
                                <div className="mb-4 text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {story.result}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {story.details}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Certifications & Awards */}
                <div className="mb-16 grid gap-8 lg:grid-cols-2">
                    {/* Certifications */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900"
                    >
                        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                            Certifications & Compliance
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {certifications.map((cert, index) => (
                                <div key={index} className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                    <div className="text-2xl">{cert.icon}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {cert.name}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            {cert.description} • {cert.year}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Awards */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900"
                    >
                        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                            Awards & Recognition
                        </h3>
                        <div className="space-y-4">
                            {awards.map((award, index) => (
                                <div key={index} className="flex items-start gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                    <div className="text-2xl">{award.icon}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {award.title}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            {award.organization} • {award.year}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Client Showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-900 md:p-12">
                        <Award className="mx-auto mb-6 h-16 w-16 text-orange-600 dark:text-orange-400" />
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Trusted by 2000+ Businesses
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Join successful companies across Indonesia and Southeast Asia who rely on
                            Genfity for their WhatsApp broadcast marketing campaigns.
                        </p>

                        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 md:grid-cols-6">
                            {clientLogos.map((client, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-center justify-center rounded-lg bg-gray-50/70 dark:bg-gray-800/70 p-3 sm:p-4"
                                >
                                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{client.logo}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-300">
                                        {client.name}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 md:grid-cols-3">
                            <div className="rounded-lg bg-orange-100/70 dark:bg-orange-900/30 p-3 sm:p-4">
                                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">2000+</div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Active clients</div>
                            </div>
                            <div className="rounded-lg bg-orange-100/70 dark:bg-orange-900/30 p-3 sm:p-4">
                                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">50M+</div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Messages sent monthly</div>
                            </div>
                            <div className="rounded-lg bg-orange-100/70 dark:bg-orange-900/30 p-3 sm:p-4">
                                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">99.2%</div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Client satisfaction</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}