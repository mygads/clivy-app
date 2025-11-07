"use client"

import { motion } from "framer-motion"
import { BarChart3, CheckCircle, MessageSquare, Send, Star, TrendingUp, Users, Zap } from "lucide-react"

const pricingPlans = [
    {
        name: "Basic Broadcast",
        description: "Perfect for small businesses starting with WhatsApp marketing campaigns",
        price: 299000,
        period: "month",
        popular: false,
        features: [
            "Up to 5,000 messages/month",
            "Basic audience segmentation",
            "Text & image messages",
            "Basic analytics dashboard",
            "Email support",
            "5 message templates",
            "Campaign scheduling",
            "Standard delivery speed"
        ],
        limitations: [
            "No video messages",
            "No advanced targeting",
            "Basic reporting only"
        ],
        color: "gray"
    },
    {
        name: "Professional",
        description: "Ideal for growing businesses with regular broadcast campaigns",
        price: 799000,
        period: "month",
        popular: true,
        features: [
            "Up to 25,000 messages/month",
            "Advanced audience segmentation",
            "All message types (text, media, video)",
            "Detailed analytics & reporting",
            "Priority support",
            "25 message templates",
            "Advanced campaign scheduling",
            "High-speed delivery",
            "A/B testing campaigns",
            "Custom audience filters",
            "Performance optimization"
        ],
        limitations: [
            "No white-label options",
            "Standard API access"
        ],
        color: "orange"
    },
    {
        name: "Enterprise",
        description: "Comprehensive solution for large-scale broadcast marketing operations",
        price: 1999000,
        period: "month",
        popular: false,
        features: [
            "Up to 100,000 messages/month",
            "Unlimited audience segments",
            "All premium message formats",
            "Advanced analytics & BI reports",
            "24/7 dedicated support",
            "Unlimited message templates",
            "Priority delivery infrastructure",
            "Maximum delivery speed",
            "Multi-variate campaign testing",
            "Custom API integrations",
            "Dedicated account manager",
            "White-label solution",
            "Custom reporting dashboard",
            "Advanced automation workflows"
        ],
        limitations: [],
        color: "purple"
    }
]

const additionalServices = [
    {
        name: "Extra Messages",
        description: "Additional messages beyond plan limit",
        price: "Rp 60/message",
        icon: MessageSquare
    },
    {
        name: "Campaign Management",
        description: "Professional campaign creation and optimization",
        price: "Rp 5,000,000/month",
        icon: Users
    },
    {
        name: "Custom Templates",
        description: "Professional template design service",
        price: "Rp 500,000/template",
        icon: Star
    },
    {
        name: "Advanced Analytics",
        description: "Custom reporting and business intelligence",
        price: "Rp 1,500,000/month",
        icon: TrendingUp
    }
]

const comparisonFeatures = [
    {
        category: "Campaign Management",
        features: [
            { name: "Monthly Message Limit", basic: "5,000", professional: "25,000", enterprise: "100,000" },
            { name: "Audience Segments", basic: "5", professional: "25", enterprise: "Unlimited" },
            { name: "Message Templates", basic: "5", professional: "25", enterprise: "Unlimited" },
            { name: "Campaign Scheduling", basic: true, professional: true, enterprise: true },
            { name: "A/B Testing", basic: false, professional: true, enterprise: true }
        ]
    },
    {
        category: "Message Types",
        features: [
            { name: "Text Messages", basic: true, professional: true, enterprise: true },
            { name: "Image Messages", basic: true, professional: true, enterprise: true },
            { name: "Video Messages", basic: false, professional: true, enterprise: true },
            { name: "Document Messages", basic: false, professional: true, enterprise: true },
            { name: "Interactive Messages", basic: false, professional: true, enterprise: true }
        ]
    },
    {
        category: "Analytics & Support",
        features: [
            { name: "Basic Analytics", basic: true, professional: true, enterprise: true },
            { name: "Advanced Reporting", basic: false, professional: true, enterprise: true },
            { name: "Custom Dashboards", basic: false, professional: false, enterprise: true },
            { name: "Support Response", basic: "24h", professional: "4h", enterprise: "1h" },
            { name: "Dedicated Manager", basic: false, professional: false, enterprise: true }
        ]
    }
]

const campaignPackages = [
    {
        name: "Flash Sale Package",
        description: "High-impact promotional campaigns",
        price: 2500000,
        period: "campaign",
        includes: ["Up to 50,000 messages", "Custom template design", "Audience targeting", "Real-time analytics", "Campaign optimization"]
    },
    {
        name: "Product Launch Bundle",
        description: "Complete product introduction campaign",
        price: 4500000,
        period: "campaign",
        includes: ["Multi-phase messaging", "Rich media content", "Audience segmentation", "A/B testing", "Performance analysis", "Follow-up campaigns"]
    },
    {
        name: "Brand Awareness Campaign",
        description: "Long-term brand building strategy",
        price: 8000000,
        period: "3 months",
        includes: ["Monthly campaigns", "Content strategy", "Audience research", "Cross-platform integration", "Detailed reporting", "Ongoing optimization"]
    }
]

const faqs = [
    {
        question: "How does message pricing work?",
        answer: "Each plan includes a monthly message allowance. Additional messages are charged at Rp 60 per message. Message pricing includes delivery, analytics, and basic support."
    },
    {
        question: "Can I change my plan anytime?",
        answer: "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle."
    },
    {
        question: "What types of messages can I send?",
        answer: "We support text, image, video, document, and interactive messages. Higher-tier plans include access to more message formats and features."
    },
    {
        question: "Is there a setup fee?",
        answer: "No setup fees for Basic and Professional plans. Enterprise plan includes free setup and migration assistance from existing platforms."
    },
    {
        question: "Do you offer campaign management services?",
        answer: "Yes, we offer professional campaign management services including strategy, content creation, targeting, and optimization for an additional fee."
    }
]

export default function WhatsAppBroadcastPricing() {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

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
                        Flexible Broadcast Pricing
                    </h2>
                    <p className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Choose the perfect WhatsApp broadcast plan for your marketing needs. Start small
                        and scale up as your campaigns grow with transparent, performance-driven pricing.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="mb-12 sm:mb-16 grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border p-4 sm:p-6 md:p-8 shadow-sm ${plan.popular
                                ? "border-orange-500/50 dark:border-orange-400/50"
                                : "border-gray-200/50 dark:border-gray-700/50"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-orange-500 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold text-white">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6 sm:mb-8 text-center">
                                <h3 className="mb-1 sm:mb-2 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                    {plan.name}
                                </h3>
                                <p className="mb-4 sm:mb-6 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {plan.description}
                                </p>
                                <div className="mb-4 sm:mb-6">
                                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                        {formatPrice(plan.price)}
                                    </span>
                                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">/{plan.period}</span>
                                </div>
                            </div>

                            <div className="mb-6 sm:mb-8">
                                <h4 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                                    Everything included:
                                </h4>
                                <ul className="space-y-2 sm:space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 sm:gap-3">
                                            <CheckCircle className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {plan.limitations.length > 0 && (
                                <div className="mb-6 sm:mb-8">
                                    <h4 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400">
                                        Not included:
                                    </h4>
                                    <ul className="space-y-1 sm:space-y-2">
                                        {plan.limitations.map((limitation, idx) => (
                                            <li key={idx} className="flex items-start gap-2 sm:gap-3">
                                                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0"></div>
                                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{limitation}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                className={`w-full rounded-xl py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all ${plan.popular
                                    ? "bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                                    : "bg-gray-100/70 dark:bg-gray-700/70 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                                    }`}
                            >
                                Start Campaign
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Campaign Packages */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-12 sm:mb-16 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 md:p-12 shadow-sm"
                >
                    <div className="text-center">
                        <h3 className="mb-4 sm:mb-6 md:mb-8 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Specialized Campaign Packages
                        </h3>
                        <p className="mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                            Professional campaign packages with full-service management for specific marketing objectives
                        </p>
                    </div>

                    <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
                        {campaignPackages.map((package_item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-700"
                            >
                                <h4 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                                    {package_item.name}
                                </h4>
                                <p className="mb-4 text-gray-600 dark:text-gray-300">
                                    {package_item.description}
                                </p>
                                <div className="mb-4 text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {formatPrice(package_item.price)}
                                    <span className="text-sm font-normal text-gray-600 dark:text-gray-300">
                                        /{package_item.period}
                                    </span>
                                </div>
                                <ul className="space-y-2">
                                    {package_item.includes.map((item, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                            <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-orange-500 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Additional Services */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                            Additional Services & Add-ons
                        </h3>
                        <p className="mb-12 text-gray-600 dark:text-gray-300">
                            Enhance your broadcast campaigns with professional services and premium features
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {additionalServices.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                    <service.icon className="h-6 w-6" />
                                </div>
                                <h4 className="mb-2 font-bold text-gray-900 dark:text-white">
                                    {service.name}
                                </h4>
                                <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                                    {service.description}
                                </p>
                                <div className="font-semibold text-orange-600 dark:text-orange-400">
                                    {service.price}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Feature Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                            Detailed Feature Comparison
                        </h3>
                        <p className="mb-12 text-gray-600 dark:text-gray-300">
                            Compare all features across our WhatsApp broadcast plans to find the perfect match
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-gray-800">
                        {comparisonFeatures.map((category, categoryIndex) => (
                            <div key={categoryIndex}>
                                {/* Category Header */}
                                <div className="border-b bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                        {category.category}
                                    </h4>
                                </div>

                                {/* Features */}
                                {category.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="grid grid-cols-4 gap-6 border-b px-6 py-4 dark:border-gray-700">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {feature.name}
                                        </div>
                                        <div className="text-center">
                                            {feature.basic === true ? (
                                                <CheckCircle className="mx-auto h-5 w-5 text-orange-500" />
                                            ) : feature.basic === false ? (
                                                <div className="mx-auto h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                            ) : (
                                                <span className="text-gray-600 dark:text-gray-300">{feature.basic}</span>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            {feature.professional === true ? (
                                                <CheckCircle className="mx-auto h-5 w-5 text-orange-500" />
                                            ) : feature.professional === false ? (
                                                <div className="mx-auto h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                            ) : (
                                                <span className="text-gray-600 dark:text-gray-300">{feature.professional}</span>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            {feature.enterprise === true ? (
                                                <CheckCircle className="mx-auto h-5 w-5 text-orange-500" />
                                            ) : feature.enterprise === false ? (
                                                <div className="mx-auto h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                            ) : (
                                                <span className="text-gray-600 dark:text-gray-300">{feature.enterprise}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center">
                        <h3 className="mb-12 text-2xl font-bold text-gray-900 dark:text-white">
                            Frequently Asked Questions
                        </h3>
                    </div>

                    <div className="mx-auto max-w-3xl space-y-6">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800"
                            >
                                <h4 className="mb-3 font-bold text-gray-900 dark:text-white">
                                    {faq.question}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white md:p-12">
                        <Send className="mx-auto mb-6 h-16 w-16" />
                        <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                            Ready to Boost Your Sales?
                        </h3>
                        <p className="mb-8 text-orange-100">
                            Start your first WhatsApp broadcast campaign today and see immediate results.
                            Join thousands of businesses already using our platform for successful marketing.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <button className="rounded-xl bg-white px-8 py-4 font-semibold text-orange-600 transition-all hover:bg-gray-100">
                                Start Free Campaign
                            </button>
                            <button className="rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-orange-600">
                                Schedule Demo
                            </button>
                        </div>
                        <p className="mt-6 text-sm text-orange-200">
                            Questions? Contact our sales team at sales@clivy.com or +62 21 1234 5678
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}