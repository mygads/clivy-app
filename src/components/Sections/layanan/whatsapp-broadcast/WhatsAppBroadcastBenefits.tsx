"use client"

import { motion } from "framer-motion"
import { BarChart3, Clock, DollarSign, Globe, MessageSquare, Send, Target, TrendingUp, Users, Zap } from "lucide-react"

const benefits = [
    {
        icon: TrendingUp,
        title: "Increased Sales Conversion",
        description: "Drive immediate sales with direct promotional messages that reach customers instantly on their preferred platform.",
        color: "text-orange-600 dark:text-orange-400"
    },
    {
        icon: Users,
        title: "Enhanced Customer Reach",
        description: "Connect with your entire customer database simultaneously for maximum campaign impact and brand awareness.",
        color: "text-blue-600 dark:text-blue-400"
    },
    {
        icon: Clock,
        title: "Time-Efficient Marketing",
        description: "Save hours of manual messaging with automated broadcast campaigns that deliver consistent results.",
        color: "text-green-600 dark:text-green-400"
    },
    {
        icon: DollarSign,
        title: "Cost-Effective Advertising",
        description: "Reduce marketing costs significantly compared to traditional advertising channels with higher engagement rates.",
        color: "text-purple-600 dark:text-purple-400"
    },
    {
        icon: Target,
        title: "Targeted Messaging",
        description: "Segment your audience for personalized campaigns that resonate with specific customer groups and demographics.",
        color: "text-red-600 dark:text-red-400"
    },
    {
        icon: BarChart3,
        title: "Measurable Results",
        description: "Track campaign performance with detailed analytics to optimize future broadcasts and improve ROI continuously.",
        color: "text-yellow-600 dark:text-yellow-400"
    }
]

const statistics = [
    { value: "98%", label: "Open Rate", description: "Higher than email marketing" },
    { value: "45%", label: "Click-Through Rate", description: "Industry-leading engagement" },
    { value: "<5min", label: "Campaign Setup", description: "Quick deployment time" },
    { value: "24/7", label: "Global Delivery", description: "Worldwide message reach" }
]

const businessImpact = [
    {
        metric: "Customer Engagement",
        improvement: "+400%",
        description: "Higher engagement vs traditional channels"
    },
    {
        metric: "Marketing Efficiency",
        improvement: "+300%",
        description: "Faster campaign deployment and results"
    },
    {
        metric: "Cost Reduction",
        improvement: "-70%",
        description: "Lower costs compared to SMS/email"
    },
    {
        metric: "Revenue Growth",
        improvement: "+250%",
        description: "Increased sales from targeted campaigns"
    }
]

const industries = [
    {
        name: "Retail & E-commerce",
        useCases: ["Flash sale announcements", "New product launches", "Abandoned cart recovery", "Seasonal promotions"]
    },
    {
        name: "Restaurants & Food",
        useCases: ["Daily menu updates", "Special offers", "Event announcements", "Delivery promotions"]
    },
    {
        name: "Real Estate",
        useCases: ["Property listings", "Open house notifications", "Market updates", "Investment opportunities"]
    },
    {
        name: "Healthcare",
        useCases: ["Health tips", "Appointment reminders", "Wellness programs", "Emergency notifications"]
    }
]

const campaignEffectiveness = [
    {
        type: "Promotional Campaigns",
        openRate: "96%",
        clickRate: "42%",
        conversionRate: "12%",
        description: "Product launches and sales announcements"
    },
    {
        type: "Event Notifications",
        openRate: "94%",
        clickRate: "38%",
        conversionRate: "15%",
        description: "Webinars, workshops, and special events"
    },
    {
        type: "Customer Updates",
        openRate: "97%",
        clickRate: "35%",
        conversionRate: "8%",
        description: "Company news and service announcements"
    },
    {
        type: "Loyalty Programs",
        openRate: "98%",
        clickRate: "48%",
        conversionRate: "18%",
        description: "Exclusive offers for loyal customers"
    }
]

export default function WhatsAppBroadcastBenefits() {
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
                        Maximize Your Marketing Impact
                    </h2>
                    <p className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Discover how WhatsApp broadcast campaigns can transform your customer communication,
                        increase engagement, and drive measurable business growth across all industries.
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                <div className="mb-12 sm:mb-16 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 shadow-sm transition-all hover:shadow-xl"
                        >
                            <div className={`mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gray-100/70 dark:bg-gray-800/70 transition-all group-hover:scale-110 ${benefit.color}`}>
                                <benefit.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                            </div>
                            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                {benefit.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Performance Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 md:p-12 shadow-sm"
                >
                    <div className="text-center">
                        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">`
                            Exceptional Campaign Performance
                        </h3>
                        <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                            Our WhatsApp broadcast platform delivers outstanding results across all campaign types and industries
                        </p>
                    </div>

                    <div className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {statistics.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center p-4 sm:p-6 rounded-xl bg-orange-100/50 dark:bg-orange-900/30"
                            >
                                <div className="mb-1 sm:mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 dark:text-orange-400">
                                    {stat.value}
                                </div>
                                <div className="mb-1 text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                    {stat.label}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                    {stat.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Business Impact */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-4 sm:mb-6 md:mb-8 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Proven Business Impact
                        </h3>
                        <p className="mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                            See how businesses achieve remarkable results with WhatsApp broadcast campaigns across key metrics
                        </p>
                    </div>

                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {businessImpact.map((impact, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 text-center shadow-sm"
                            >
                                <div className="mb-1 sm:mb-2 text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                                    {impact.improvement}
                                </div>
                                <h4 className="mb-1 sm:mb-2 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                                    {impact.metric}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                    {impact.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Campaign Effectiveness */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 md:p-12 shadow-sm"
                >
                    <div className="text-center">
                        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Campaign Type Performance
                        </h3>
                        <p className="mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                            Different campaign types deliver varying performance metrics, helping you choose the right approach
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm">
                            <thead>
                                <tr className="border-b border-gray-200/50 dark:border-gray-600/50">
                                    <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Campaign Type</th>
                                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Open Rate</th>
                                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Click Rate</th>
                                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Conversion</th>
                                    <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaignEffectiveness.map((campaign, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="border-b border-gray-100/50 dark:border-gray-600/50"
                                    >
                                        <td className="p-3 sm:p-4 text-sm sm:text-base font-medium text-gray-900 dark:text-white">{campaign.type}</td>
                                        <td className="p-3 sm:p-4 text-center">
                                            <span className="rounded-full bg-green-100/70 dark:bg-green-900/30 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                                                {campaign.openRate}
                                            </span>
                                        </td>
                                        <td className="p-3 sm:p-4 text-center">
                                            <span className="rounded-full bg-blue-100/70 dark:bg-blue-900/30 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {campaign.clickRate}
                                            </span>
                                        </td>
                                        <td className="p-3 sm:p-4 text-center">
                                            <span className="rounded-full bg-orange-100/70 dark:bg-orange-900/30 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                {campaign.conversionRate}
                                            </span>
                                        </td>
                                        <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">{campaign.description}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Industry Applications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Industry-Specific Applications
                        </h3>
                        <p className="mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                            WhatsApp broadcast campaigns adapt to various industry needs with specialized messaging strategies
                        </p>
                    </div>

                    <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {industries.map((industry, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-sm"
                            >
                                <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
                                    {industry.name}
                                </h4>
                                <ul className="space-y-1 sm:space-y-2">
                                    {industry.useCases.map((useCase, idx) => (
                                        <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                            <div className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                                            {useCase}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ROI Calculator */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="mx-auto max-w-2xl rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 md:p-12 shadow-sm">
                        <Send className="mx-auto mb-4 sm:mb-6 h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-orange-600 dark:text-orange-400" />
                        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            Calculate Your Campaign ROI
                        </h3>
                        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                            Businesses typically see 5-8x ROI from WhatsApp broadcast campaigns within the first month.
                            Start your campaign today and measure the immediate impact on your sales.
                        </p>
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                            <div className="rounded-lg bg-orange-100/70 dark:bg-orange-900/30 p-3 sm:p-4">
                                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">5-8x</div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Average ROI</div>
                            </div>
                            <div className="rounded-lg bg-orange-100/70 dark:bg-orange-900/30 p-3 sm:p-4">
                                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">7 Days</div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Time to results</div>
                            </div>
                            <div className="rounded-lg bg-orange-100/70 dark:bg-orange-900/30 p-3 sm:p-4">
                                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">95%</div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Customer satisfaction</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}