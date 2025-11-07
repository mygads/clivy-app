"use client"

import { motion } from "framer-motion"
import { Award, Clock, Globe, MessageSquare, Shield, Star, TrendingUp, Users } from "lucide-react"

const advantages = [
    {
        icon: MessageSquare,
        title: "Official WhatsApp Partner",
        description: "Certified WhatsApp Business Solution Provider with direct API access and premium support channels.",
        highlight: "BSP Certified"
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        description: "End-to-end encryption, SOC 2 compliance, and enterprise-grade security protocols for data protection.",
        highlight: "SOC 2 Compliant"
    },
    {
        icon: TrendingUp,
        title: "99.9% Uptime Guarantee",
        description: "Industry-leading uptime with redundant infrastructure and 24/7 monitoring for reliable message delivery.",
        highlight: "SLA Backed"
    },
    {
        icon: Clock,
        title: "Lightning Fast Delivery",
        description: "Sub-second message delivery with global CDN and optimized routing for instant customer communication.",
        highlight: "<200ms Response"
    },
    {
        icon: Globe,
        title: "Global Infrastructure",
        description: "Worldwide presence with local data centers ensuring low latency and compliance with regional regulations.",
        highlight: "30+ Countries"
    },
    {
        icon: Users,
        title: "Expert Support Team",
        description: "Dedicated technical support with WhatsApp API specialists available 24/7 for implementation assistance.",
        highlight: "24/7 Support"
    }
]

const testimonials = [
    {
        company: "TechnoMart Indonesia",
        industry: "E-commerce",
        logo: "🛒",
        testimonial: "Clivy's WhatsApp API increased our customer engagement by 400%. The integration was seamless and support was exceptional.",
        author: "Sarah Chen",
        position: "CTO",
        metrics: {
            engagement: "+400%",
            response: "2x faster",
            satisfaction: "95%"
        }
    },
    {
        company: "HealthCare Plus",
        industry: "Healthcare",
        logo: "🏥",
        testimonial: "Patient appointment reminders via WhatsApp reduced no-shows by 60%. The reliability is outstanding for critical communications.",
        author: "Dr. Ahmad Rahman",
        position: "Operations Director",
        metrics: {
            noShows: "-60%",
            efficiency: "+80%",
            adoption: "98%"
        }
    },
    {
        company: "EduLearn Academy",
        industry: "Education",
        logo: "🎓",
        testimonial: "WhatsApp API transformed our student communication. Parents now receive instant updates about their children's progress.",
        author: "Maria Santos",
        position: "Principal",
        metrics: {
            participation: "+250%",
            satisfaction: "92%",
            engagement: "+300%"
        }
    }
]

const certifications = [
    {
        name: "WhatsApp BSP",
        description: "Business Solution Provider",
        icon: "✅",
        year: "2024"
    },
    {
        name: "ISO 27001",
        description: "Information Security",
        icon: "🔒",
        year: "2023"
    },
    {
        name: "SOC 2 Type II",
        description: "Security & Compliance",
        icon: "🛡️",
        year: "2024"
    },
    {
        name: "GDPR Compliant",
        description: "Data Protection",
        icon: "🇪🇺",
        year: "2023"
    }
]

const competitiveAdvantages = [
    {
        feature: "API Response Time",
        clivy: "<200ms",
        competitor: "500ms+",
        advantage: "2.5x faster"
    },
    {
        feature: "Uptime Guarantee",
        clivy: "99.9%",
        competitor: "99.5%",
        advantage: "4x less downtime"
    },
    {
        feature: "Support Response",
        clivy: "<15 minutes",
        competitor: "2-4 hours",
        advantage: "8x faster support"
    },
    {
        feature: "Global Reach",
        clivy: "180+ countries",
        competitor: "50-100 countries",
        advantage: "2x more coverage"
    },
    {
        feature: "Message Delivery",
        clivy: "99.8%",
        competitor: "95-97%",
        advantage: "3-5% higher"
    }
]

const awards = [
    {
        title: "Best WhatsApp Integration 2024",
        organization: "Southeast Asia Tech Awards",
        year: "2024",
        icon: "🏆"
    },
    {
        title: "Excellence in Customer Communication",
        organization: "Indonesia Digital Awards",
        year: "2024",
        icon: "🌟"
    },
    {
        title: "Top Enterprise Solution Provider",
        organization: "ASEAN Business Awards",
        year: "2023",
        icon: "🎖️"
    }
]

const clientLogos = [
    { name: "TechnoMart", logo: "🛒" },
    { name: "HealthCare Plus", logo: "🏥" },
    { name: "EduLearn", logo: "🎓" },
    { name: "FinanceFlow", logo: "💰" },
    { name: "RetailMax", logo: "🏪" },
    { name: "TravelGo", logo: "✈️" }
]

export default function WhatsAppAPIWhyChoose() {
    return (
        <section className="py-12 sm:py-16 md:py-20 bg-white sm:bg-gradient-to-br sm:from-white sm:via-green-50/30 sm:to-white dark:bg-gray-800 dark:sm:from-gray-900 dark:sm:via-gray-800 dark:sm:to-green-900/20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                        Why Choose Clivy WhatsApp API?
                    </h2>
                    <p className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                        Experience the difference with Indonesia&apos;s leading WhatsApp Business Solution Provider.
                        Trusted by 1000+ businesses for reliable, secure, and scalable messaging solutions.
                    </p>
                </motion.div>

                {/* Key Advantages */}
                <div className="mb-12 sm:mb-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {advantages.map((advantage, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-6 sm:p-8 shadow-sm transition-all hover:shadow-xl border border-gray-100 dark:border-gray-700"
                        >
                            <div className="mb-3 sm:mb-4 flex items-center justify-between">
                                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 transition-all group-hover:scale-110 dark:bg-green-900/20 dark:text-green-400">
                                    <advantage.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                                </div>
                                <span className="rounded-full bg-green-50 px-2 sm:px-3 py-1 text-xs font-semibold text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                    {advantage.highlight}
                                </span>
                            </div>
                            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
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
                    className="mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-12 text-2xl font-bold text-gray-900 dark:text-white">
                            Trusted by Leading Businesses
                        </h3>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900"
                            >
                                <div className="mb-6">
                                    <div className="mb-4 flex items-center gap-4">
                                        <div className="text-4xl">{testimonial.logo}</div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">
                                                {testimonial.company}
                                            </h4>
                                            <p className="text-sm text-green-600 dark:text-green-400">
                                                {testimonial.industry}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mb-4 flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <blockquote className="mb-6 text-gray-600 dark:text-gray-300 italic">
                                        &ldquo;{testimonial.testimonial}&rdquo;
                                    </blockquote>
                                </div>

                                <div className="mb-6 grid grid-cols-3 gap-4 border-t pt-6 dark:border-gray-700">
                                    {Object.entries(testimonial.metrics).map(([key, value], idx) => (
                                        <div key={idx} className="text-center">
                                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {value}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {key}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/20">
                                        <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {testimonial.author}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            {testimonial.position}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Competitive Advantages */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                            Outperforming the Competition
                        </h3>
                        <p className="mb-12 text-green-100">
                            See how Clivy&apos;s WhatsApp API stacks up against other providers in key performance metrics
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full rounded-xl bg-white/10 backdrop-blur-sm">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="p-4 text-left font-semibold">Feature</th>
                                    <th className="p-4 text-center font-semibold">Clivy</th>
                                    <th className="p-4 text-center font-semibold">Competitors</th>
                                    <th className="p-4 text-center font-semibold">Advantage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competitiveAdvantages.map((item, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="border-b border-white/10"
                                    >
                                        <td className="p-4 font-medium">{item.feature}</td>
                                        <td className="p-4 text-center">
                                            <span className="rounded-full bg-green-400 px-3 py-1 text-sm font-semibold text-green-900">
                                                {item.clivy}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-green-200">{item.competitor}</td>
                                        <td className="p-4 text-center">
                                            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                                                {item.advantage}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
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

                {/* Client Logos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-900 md:p-12">
                        <Award className="mx-auto mb-6 h-16 w-16 text-green-600 dark:text-green-400" />
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Trusted by 1000+ Businesses
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Join leading companies across Indonesia and Southeast Asia who trust Clivy
                            for their WhatsApp Business communication needs.
                        </p>

                        <div className="grid grid-cols-3 gap-6 md:grid-cols-6">
                            {clientLogos.map((client, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                                >
                                    <div className="text-2xl mb-2">{client.logo}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-300">
                                        {client.name}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-3">
                            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">1000+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Active clients</div>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">10M+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Messages sent daily</div>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">99.8%</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Client satisfaction</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}