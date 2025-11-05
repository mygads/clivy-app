"use client"

import { motion } from "framer-motion"
import { CheckCircle, MessageSquare, Smartphone, Star, TrendingUp, Zap } from "lucide-react"

const pricingPlans = [
    {
        name: "Starter",
        description: "Perfect for small businesses getting started with WhatsApp messaging",
        price: 599000,
        period: "month",
        popular: false,
        features: [
            "Up to 1,000 messages/month",
            "Text & media messages",
            "Webhook integration",
            "Basic analytics",
            "Email support",
            "Message templates (5)",
            "API rate: 20 msg/second",
            "Response time: 24 hours"
        ],
        limitations: [
            "No interactive messages",
            "No advanced analytics",
            "Limited template approval"
        ],
        color: "gray"
    },
    {
        name: "Business",
        description: "Ideal for growing businesses with moderate messaging needs",
        price: 1299000,
        period: "month",
        popular: true,
        features: [
            "Up to 10,000 messages/month",
            "All message types",
            "Advanced webhooks",
            "Detailed analytics",
            "Priority support",
            "Message templates (25)",
            "API rate: 100 msg/second",
            "Response time: 2 hours",
            "Interactive messages",
            "Message scheduling",
            "Delivery reports"
        ],
        limitations: [
            "No white-label options",
            "Standard SLA"
        ],
        color: "green"
    },
    {
        name: "Enterprise",
        description: "Comprehensive solution for large enterprises with high-volume needs",
        price: 3499000,
        period: "month",
        popular: false,
        features: [
            "Up to 100,000 messages/month",
            "All premium features",
            "Custom webhooks",
            "Advanced analytics & reporting",
            "24/7 dedicated support",
            "Unlimited message templates",
            "API rate: 250 msg/second",
            "Response time: 15 minutes",
            "White-label solution",
            "Custom integrations",
            "Priority template approval",
            "Dedicated account manager",
            "Custom SLA",
            "Advanced security features"
        ],
        limitations: [],
        color: "purple"
    }
]

const additionalServices = [
    {
        name: "Extra Messages",
        description: "Additional messages beyond plan limit",
        price: "Rp 150/message",
        icon: MessageSquare
    },
    {
        name: "Custom Integration",
        description: "Dedicated development for custom requirements",
        price: "Rp 15,000,000",
        icon: Zap
    },
    {
        name: "Priority Support",
        description: "24/7 premium technical support",
        price: "Rp 2,500,000/month",
        icon: Star
    },
    {
        name: "Advanced Analytics",
        description: "Custom reporting and business intelligence",
        price: "Rp 1,200,000/month",
        icon: TrendingUp
    }
]

const comparisonFeatures = [
    {
        category: "Messaging",
        features: [
            { name: "Text Messages", starter: true, business: true, enterprise: true },
            { name: "Media Messages", starter: true, business: true, enterprise: true },
            { name: "Interactive Messages", starter: false, business: true, enterprise: true },
            { name: "Template Messages", starter: "5", business: "25", enterprise: "Unlimited" },
            { name: "Message Scheduling", starter: false, business: true, enterprise: true }
        ]
    },
    {
        category: "API & Integration",
        features: [
            { name: "Webhook Support", starter: "Basic", business: "Advanced", enterprise: "Custom" },
            { name: "API Rate Limit", starter: "20/sec", business: "100/sec", enterprise: "250/sec" },
            { name: "Custom Integrations", starter: false, business: false, enterprise: true },
            { name: "White-label Solution", starter: false, business: false, enterprise: true }
        ]
    },
    {
        category: "Support & SLA",
        features: [
            { name: "Support Response", starter: "24h", business: "2h", enterprise: "15min" },
            { name: "Support Channel", starter: "Email", business: "Email + Chat", enterprise: "24/7 Dedicated" },
            { name: "Account Manager", starter: false, business: false, enterprise: true },
            { name: "Custom SLA", starter: false, business: false, enterprise: true }
        ]
    }
]

const faqs = [
    {
        question: "How does the message pricing work?",
        answer: "Each plan includes a monthly message allowance. Additional messages are charged at Rp 150 per message. Message pricing includes delivery, read receipts, and basic analytics."
    },
    {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle. Unused messages don't carry over."
    },
    {
        question: "What types of messages are supported?",
        answer: "We support text, image, video, document, audio, location, and interactive messages (buttons, lists). Template messages require WhatsApp approval before use."
    },
    {
        question: "Is there a setup fee?",
        answer: "No setup fees for Starter and Business plans. Enterprise plan includes free setup and migration assistance. Custom integrations may have separate development costs."
    },
    {
        question: "What's included in the free trial?",
        answer: "7-day free trial with 100 test messages, full feature access, and technical support. No credit card required. WhatsApp Business verification required before production use."
    }
]

export default function WhatsAppAPIPricing() {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    return (
        <section className="bg-white sm:bg-gradient-to-br sm:from-white sm:via-green-50/30 sm:to-white py-20 pb-28 dark:bg-gray-900 dark:sm:from-gray-900 dark:sm:via-green-900/10 dark:sm:to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-4xl text-center"
                >
                    <h2 className="mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="mb-12 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                        Choose the perfect WhatsApp API plan for your business needs. Start with our free trial
                        and scale as you grow with flexible pricing options.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="mb-16 grid gap-6 sm:gap-8 lg:grid-cols-3">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-6 sm:p-8 shadow-lg ${plan.popular
                                ? "border-2 border-green-500 dark:border-green-400"
                                : "border border-gray-200 dark:border-gray-700"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6 sm:mb-8 text-center">
                                <h3 className="mb-2 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                    {plan.name}
                                </h3>
                                <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
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
                                            <CheckCircle className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                                            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {plan.limitations.length > 0 && (
                                <div className="mb-6 sm:mb-8">
                                    <h4 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400">
                                        Not included:
                                    </h4>
                                    <ul className="space-y-2">
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
                                    ? "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                    : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                    }`}
                            >
                                Start Free Trial
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Services */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 md:p-12"
                >
                    <div className="text-center">
                        <h3 className="mb-6 sm:mb-8 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Additional Services & Add-ons
                        </h3>
                        <p className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            Extend your WhatsApp API capabilities with premium services and custom solutions
                        </p>
                    </div>

                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {additionalServices.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-sm"
                            >
                                <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                    <service.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <h4 className="mb-2 text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                    {service.name}
                                </h4>
                                <p className="mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {service.description}
                                </p>
                                <div className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400">
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
                        <h3 className="mb-6 sm:mb-8 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Detailed Feature Comparison
                        </h3>
                        <p className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            Compare all features across our WhatsApp API plans to find the perfect fit
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        {comparisonFeatures.map((category, categoryIndex) => (
                            <div key={categoryIndex}>
                                {/* Category Header */}
                                <div className="border-b bg-gray-50/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 dark:border-gray-700">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                        {category.category}
                                    </h4>
                                </div>

                                {/* Features */}
                                {category.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="grid grid-cols-4 gap-4 sm:gap-6 border-b px-4 sm:px-6 py-3 sm:py-4 dark:border-gray-700">
                                        <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                                            {feature.name}
                                        </div>
                                        <div className="text-center">
                                            {feature.starter === true ? (
                                                <CheckCircle className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                            ) : feature.starter === false ? (
                                                <div className="mx-auto h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                            ) : (
                                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{feature.starter}</span>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            {feature.business === true ? (
                                                <CheckCircle className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                            ) : feature.business === false ? (
                                                <div className="mx-auto h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                            ) : (
                                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{feature.business}</span>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            {feature.enterprise === true ? (
                                                <CheckCircle className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                            ) : feature.enterprise === false ? (
                                                <div className="mx-auto h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                            ) : (
                                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{feature.enterprise}</span>
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
                        <h3 className="mb-8 sm:mb-12 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Frequently Asked Questions
                        </h3>
                    </div>

                    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-sm"
                            >
                                <h4 className="mb-3 text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">
                                    {faq.question}
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
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
                    <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 sm:p-8 md:p-12 text-white">
                        <Smartphone className="mx-auto mb-4 sm:mb-6 h-12 w-12 sm:h-16 sm:w-16" />
                        <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl font-bold">
                            Ready to Get Started?
                        </h3>
                        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-green-100 leading-relaxed">
                            Start your 7-day free trial today with 100 test messages and full feature access.
                            No credit card required, no setup fees.
                        </p>
                        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center">
                            <button className="rounded-xl bg-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-green-600 transition-all hover:bg-gray-100">
                                Start Free Trial
                            </button>
                            <button className="rounded-xl border-2 border-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white transition-all hover:bg-white hover:text-green-600">
                                Schedule Demo
                            </button>
                        </div>
                        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-green-200">
                            Questions? Contact our sales team at sales@genfity.com or +62 21 1234 5678
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}