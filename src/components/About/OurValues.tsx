"use client"

import { Link, Shield, Briefcase, Code, TrendingUp, Share2 } from "lucide-react"

const values = [
    {
        icon: Link,
        title: "Long-Term Commitment",
        description:
        "Client relationships are long-term investments. We support you from the early stage, through growth, to expansion. Our maintenance and support are always ready to keep your digital performance optimal.",
    },
    {
        icon: Shield,
        title: "Integrity",
        description:
        "Trust is our most valuable currency. We keep our promises, communicate updates honestly, and take full responsibility for outcomes. With integrity, we build a long-term reputation as a trusted digital partner.",
    },
    {
        icon: Briefcase,
        title: "Professionalism",
        description:
        "We uphold high work standards—from communication and project management to final quality. Every team member is trained to act quickly, take ownership, and deliver reliable service.",
    },
    {
        icon: Code,
        title: "Tailored & Flexible",
        description:
        "No two clients are identical. We listen, analyze, and design digital solutions tailored to your business. This flexibility keeps every strategy relevant and easier to execute.",
    },
    {
        icon: TrendingUp,
        title: "Real Growth",
        description:
        "We’re satisfied only when results are measurable. Every outcome—from website traffic and engagement to lead conversions—is tracked with real data. Our principle: you don’t just get a finished project; you gain tangible business growth.",
    },
    {
        icon: Share2,
        title: "Open Collaboration",
        description:
        "We believe the best creative process comes from transparent communication. Clients are actively involved in brainstorming, revisions, and evaluation. We encourage open feedback to achieve outcomes that satisfy both sides.",
    },
]

export default function OurValues() {

    return (
        <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-dark">
            <div className="container px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
                    {/* Left Column - Sticky */}
                    <div className="lg:sticky lg:top-24">
                        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm font-medium mb-3 sm:mb-4 tracking-wide uppercase">Our Values</p>
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                            Values That <span className="text-primary">Guide</span> Us
                        </h2>
                    </div>

                    {/* Right Column - Cards Grid */}
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                        {values.map((value, index) => {
                            const IconComponent = value.icon

                            return (
                                <div
                                    key={index}
                                    className="group p-6 sm:p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-700"
                                >
                                    {/* Icon */}
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors duration-300">
                                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-purple-900 dark:group-hover:text-purple-300 transition-colors duration-300">
                                        {value.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                                        {value.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
