"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, MessageSquare, Globe, Paintbrush, Headphones, DollarSign, HelpCircle } from "lucide-react"
import Link from "next/link"

type FaqItem = {
  question: string
  answer: string
  category: string
}

const faqItems: FaqItem[] = [
  // WhatsApp API FAQs
  {
    question: "Apa itu WhatsApp API?",
    answer:
      "WhatsApp API adalah antarmuka pemrograman aplikasi yang memungkinkan bisnis berkomunikasi secara otomatis dengan pelanggan mereka melalui WhatsApp. Ini memungkinkan pengiriman pesan massal, balasan otomatis, dan integrasi dengan sistem bisnis lainnya seperti CRM dan platform e-commerce.",
    category: "whatsapp",
  },
  {
    question: "Apa manfaat menggunakan WhatsApp API untuk bisnis?",
    answer:
      "WhatsApp API memungkinkan bisnis berkomunikasi dengan pelanggan secara otomatis dan terstruktur. Manfaatnya antara lain: customer support 24/7, notifikasi order/pembayaran otomatis, marketing campaigns yang personal, integration dengan CRM, analytics yang detail, dan tingkat engagement yang tinggi karena WhatsApp memiliki open rate hingga 98%.",
    category: "whatsapp",
  },
  {
    question: "Bagaimana cara WhatsApp API meningkatkan keterlibatan pelanggan?",
    answer:
      "WhatsApp memiliki tingkat keterlibatan yang sangat tinggi dibandingkan saluran komunikasi lainnya. Dengan WhatsApp API, bisnis dapat mengirim pesan langsung ke pelanggan yang aktif menggunakan aplikasi, sehingga pesan lebih mungkin dibaca dan ditindaklanjuti. Selain itu, WhatsApp merupakan alat komunikasi yang familiar dan nyaman digunakan pelanggan.",
    category: "whatsapp",
  },
  {
    question: "Apakah WhatsApp API aman untuk bisnis?",
    answer:
      "Ya, WhatsApp API dirancang dengan keamanan yang ketat. Semua pesan dienkripsi end-to-end, dan bisnis hanya dapat mengirim pesan ke pelanggan setelah mendapatkan izin eksplisit. Selain itu, WhatsApp Business API mematuhi berbagai standar keamanan dan privasi internasional untuk melindungi data pelanggan dan bisnis.",
    category: "whatsapp",
  },
  {
    question: "Apakah saya bisa mengintegrasikan WhatsApp API dengan sistem bisnis saya?",
    answer:
      "Tentu! WhatsApp API dapat diintegrasikan dengan berbagai sistem bisnis seperti CRM, platform e-commerce, sistem manajemen pesanan, dan sistem manajemen pelanggan lainnya. Kami menyediakan layanan integrasi dan pengembangan solusi kustom sesuai kebutuhan bisnis Anda.",
    category: "whatsapp",
  },
  {
    question: "Berapa biaya untuk layanan WhatsApp API dari Clivy?",
    answer:
      "Biaya layanan WhatsApp API bervariasi tergantung pada volume pesan, fitur yang dibutuhkan, dan kompleksitas integrasi. Kami menawarkan paket dengan harga transparan dan dapat disesuaikan dengan kebutuhan dan anggaran bisnis Anda. Untuk penawaran akurat, silakan konsultasi gratis dengan tim kami.",
    category: "whatsapp",
  },
]

const categories = [
  { id: "whatsapp", name: "WhatsApp API", icon: MessageSquare },
]

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<string>("whatsapp")
  const [openItems, setOpenItems] = useState<number[]>([])

  const filteredFaqs = faqItems.filter((item) => item.category === activeCategory)

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <section className="relative bg-gray-50/50 dark:bg-gray-900/50 py-12 sm:py-16 md:py-20 lg:py-24" id="faq">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              FAQ{" "}
              <span className="text-primary">
                WhatsApp API
              </span>
            </h2>
            <p className="mb-8 sm:mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Temukan jawaban untuk pertanyaan umum tentang WhatsApp API dan layanan integrasi kami
            </p>
          </motion.div>
        </div>

        {/* FAQ Items */}
        <div className="mx-auto max-w-4xl">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3 sm:space-y-4"
          >
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white pr-3 sm:pr-4 leading-relaxed">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                      openItems.includes(index) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openItems.includes(index) ? "max-h-[500px] px-4 sm:px-6 pb-4 sm:pb-6" : "max-h-0"
                  }`}
                >
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          className="mt-12 sm:mt-16 md:mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
              Tertarik menggunakan solusi WhatsApp API kami? Tim ahli kami siap membantu Anda!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-white text-sm sm:text-base transition-all duration-300 hover:bg-primary/90 hover:shadow-lg shadow-primary/25 w-full sm:w-auto justify-center"
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                Konsultasi Sekarang
              </Link>
              <Link
                href="https://wa.me/6281234567890"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 border border-green-700 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-white text-sm sm:text-base transition-all duration-300 hover:bg-green-700 hover:shadow-md w-full sm:w-auto justify-center"
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                WhatsApp Kami
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}