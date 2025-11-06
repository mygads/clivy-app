"use client"

import { motion } from "framer-motion"
import { MessageSquare, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

export default function WhatsAppCTA() {
  const locale = useLocale()
  const t = useTranslations()
  
  const features = [
    {
      icon: CheckCircle,
      title_en: "Automated Messaging",
      title_id: "Pesan Otomatis",
    },
    {
      icon: CheckCircle,
      title_en: "Webhook Integration",
      title_id: "Integrasi Webhook",
    },
    {
      icon: CheckCircle,
      title_en: "24/7 Support",
      title_id: "Dukungan 24/7",
    },
    {
      icon: CheckCircle,
      title_en: "Scalable Solution",
      title_id: "Solusi Scalable",
    },
  ]

  const isIndonesian = locale === 'id'

  return (
    <section className="relative bg-gradient-to-br from-green-600 to-green-800 dark:from-green-700 dark:to-green-900 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <span className="text-white/90 font-semibold uppercase tracking-wider text-sm">
                {isIndonesian ? 'Solusi WhatsApp Bisnis' : 'WhatsApp Business Solution'}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {isIndonesian 
                ? 'Tingkatkan Komunikasi Bisnis Dengan WhatsApp API'
                : 'Enhance Business Communication With WhatsApp API'
              }
            </h2>

            <p className="text-white/90 text-lg mb-8">
              {isIndonesian
                ? 'Integrasikan WhatsApp Business API ke sistem Anda. Kirim pesan otomatis, kelola percakapan pelanggan, dan tingkatkan engagement dengan solusi messaging yang andal.'
                : 'Integrate WhatsApp Business API into your system. Send automated messages, manage customer conversations, and boost engagement with reliable messaging solutions.'
              }
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-white"
                >
                  <feature.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">
                    {isIndonesian ? feature.title_id : feature.title_en}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/layanan/whatsapp-api`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group"
                >
                  {isIndonesian ? 'Lihat Paket' : 'View Packages'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <Link href={`/${locale}/layanan/whatsapp-api#pricing`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
                >
                  {isIndonesian ? 'Lihat Harga' : 'View Pricing'}
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              {/* Mock WhatsApp Interface */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-green-500 rounded-full p-3">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {isIndonesian ? 'WhatsApp Business API' : 'WhatsApp Business API'}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {isIndonesian ? 'Online' : 'Online'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-green-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm">
                        {isIndonesian 
                          ? 'Halo! Saya ingin informasi tentang produk Anda'
                          : 'Hi! I want information about your products'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm">
                        {isIndonesian
                          ? 'Tentu! Dengan WhatsApp API kami, Anda bisa mengirim pesan otomatis seperti ini 🚀'
                          : 'Sure! With our WhatsApp API, you can send automated messages like this 🚀'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm font-semibold mb-2">
                        {isIndonesian ? 'Fitur Utama:' : 'Key Features:'}
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>✓ {isIndonesian ? 'Pesan Otomatis' : 'Automated Messages'}</li>
                        <li>✓ {isIndonesian ? 'Integrasi Webhook' : 'Webhook Integration'}</li>
                        <li>✓ {isIndonesian ? 'Multiple Sessions' : 'Multiple Sessions'}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 rounded-full px-4 py-2 font-bold shadow-lg transform rotate-12">
                {isIndonesian ? 'Mulai Gratis!' : 'Start Free!'}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
