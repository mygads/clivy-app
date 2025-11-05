"use client"

import { motion } from "framer-motion"
import { BarChart3, FileText, MessageSquare, Send, Target, Users, Zap } from "lucide-react"

const broadcastFeatures = [
    {
        icon: Send,
        title: "Bulk Message Sending",
        description: "Send thousands of messages simultaneously to your entire customer database with guaranteed delivery.",
        features: ["Mass message delivery", "Scheduled broadcasting", "Real-time sending status", "Delivery confirmation"]
    },
    {
        icon: Target,
        title: "Audience Segmentation",
        description: "Target specific customer groups with personalized messages based on demographics and behavior.",
        features: ["Custom audience filters", "Demographic targeting", "Behavioral segmentation", "Location-based groups"]
    },
    {
        icon: BarChart3,
        title: "Campaign Analytics",
        description: "Track campaign performance with detailed analytics and insights for optimization.",
        features: ["Open rate tracking", "Click-through analysis", "Engagement metrics", "ROI measurement"]
    },
    {
        icon: FileText,
        title: "Template Management",
        description: "Create and manage professional message templates for consistent brand communication.",
        features: ["Message templates", "Brand consistency", "Template library", "Content approval"]
    }
]

const campaignTypes = [
    {
        type: "Promotional Campaigns",
        description: "Product launches, sales announcements, and special offers",
        icon: "🎯",
        examples: ["Flash sale notifications", "New product announcements", "Exclusive discount codes", "Limited time offers"]
    },
    {
        type: "Informational Broadcasts",
        description: "Company updates, news, and important announcements",
        icon: "📢",
        examples: ["Company news updates", "Service announcements", "Policy changes", "Event notifications"]
    },
    {
        type: "Customer Engagement",
        description: "Surveys, feedback requests, and community building",
        icon: "💬",
        examples: ["Customer satisfaction surveys", "Feedback collection", "Community engagement", "Loyalty programs"]
    },
    {
        type: "Transactional Messages",
        description: "Order confirmations, delivery updates, and receipts",
        icon: "📋",
        examples: ["Order confirmations", "Shipping notifications", "Payment receipts", "Service reminders"]
    }
]

const technicalSpecs = [
    { feature: "Message Delivery", value: "Up to 100,000/hour", description: "High-volume message processing" },
    { feature: "Audience Size", value: "Unlimited contacts", description: "No limit on contact database" },
    { feature: "Campaign Scheduling", value: "Advanced scheduler", description: "Time zone optimization" },
    { feature: "Template Storage", value: "Unlimited templates", description: "Rich media support" },
    { feature: "Analytics Retention", value: "12 months", description: "Historical data access" },
    { feature: "API Integration", value: "RESTful API", description: "Developer-friendly" }
]

const integrationOptions = [
    {
        platform: "E-commerce Platforms",
        integrations: ["WooCommerce", "Shopify", "Magento", "PrestaShop"],
        useCase: "Automated order notifications and promotional campaigns"
    },
    {
        platform: "CRM Systems",
        integrations: ["Salesforce", "HubSpot", "Zoho CRM", "Pipedrive"],
        useCase: "Customer data synchronization and targeted messaging"
    },
    {
        platform: "Marketing Tools",
        integrations: ["Mailchimp", "Constant Contact", "SendGrid", "Campaign Monitor"],
        useCase: "Multi-channel marketing campaign coordination"
    },
    {
        platform: "Business Applications",
        integrations: ["Google Workspace", "Microsoft 365", "Slack", "Zapier"],
        useCase: "Workflow automation and team collaboration"
    }
]

export default function WhatsAppBroadcastOverview() {
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
                        Comprehensive Broadcast Solution
                    </h2>
                    <p className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Transform your marketing strategy with powerful WhatsApp broadcast campaigns.
                        Reach your entire customer base instantly with targeted, personalized messaging that drives engagement and sales.
                    </p>
                </motion.div>

                {/* Core Features */}
                <div className="mb-12 sm:mb-16 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {broadcastFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 transition-all hover:shadow-xl"
                        >
                            <div className="mb-4 sm:mb-6 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-orange-100/70 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 transition-all group-hover:scale-110">
                                <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                            </div>
                            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                {feature.title}
                            </h3>
                            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                {feature.description}
                            </p>
                            <ul className="space-y-1.5 sm:space-y-2">
                                {feature.features.map((item, idx) => (
                                    <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        <div className="mr-1.5 sm:mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Campaign Types */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 md:p-12 shadow-xl"
                >
                    <div className="text-center">
                        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Campaign Types & Use Cases
                        </h3>
                        <p className="mb-8 sm:mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            Discover the variety of broadcast campaigns you can create to engage your audience effectively
                        </p>
                    </div>

                    <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {campaignTypes.map((campaign, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-orange-50/70 dark:bg-orange-900/20 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50 p-4 sm:p-6"
                            >
                                <div className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl">{campaign.icon}</div>
                                <h4 className="mb-2 sm:mb-3 text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">
                                    {campaign.type}
                                </h4>
                                <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {campaign.description}
                                </p>
                                <div className="space-y-1">
                                    {campaign.examples.map((example, idx) => (
                                        <div key={idx} className="text-xs text-orange-200">
                                            • {example}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Technical Specifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                            Technical Capabilities
                        </h3>
                        <p className="mb-12 text-gray-600 dark:text-gray-300">
                            Enterprise-grade broadcast infrastructure designed for high-volume, reliable message delivery
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {technicalSpecs.map((spec, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800"
                            >
                                <div className="mb-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {spec.value}
                                </div>
                                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                                    {spec.feature}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {spec.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Integration Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 p-8 dark:from-gray-800 dark:to-orange-900/20 md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                            Platform Integrations
                        </h3>
                        <p className="mb-12 text-gray-600 dark:text-gray-300">
                            Seamlessly connect your existing business tools and platforms for automated broadcast campaigns
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {integrationOptions.map((integration, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-700"
                            >
                                <h4 className="mb-4 text-lg font-bold text-orange-600 dark:text-orange-400">
                                    {integration.platform}
                                </h4>
                                <div className="mb-4 space-y-2">
                                    {integration.integrations.map((platform, idx) => (
                                        <div key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                                            • {platform}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {integration.useCase}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Message Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800 md:p-12">
                        <MessageSquare className="mx-auto mb-6 h-16 w-16 text-orange-600 dark:text-orange-400" />
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Advanced Message Management
                        </h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300">
                            Create, schedule, and manage your broadcast campaigns with our intuitive dashboard.
                            Support for rich media, personalization, and automated follow-ups.
                        </p>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">Rich Media</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Images, videos, documents</div>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">Templates</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Pre-approved message formats</div>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">Automation</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Scheduled & triggered campaigns</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}