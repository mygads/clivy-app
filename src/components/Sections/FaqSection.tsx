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
  // General FAQs
  {
    question: "Layanan apa saja yang ditawarkan oleh Genfity?",
    answer:
      "Genfity menawarkan berbagai layanan digital yang komprehensif, meliputi pengembangan website kustom, aplikasi web dan mobile, sistem korporat, desain UI/UX, WhatsApp API solutions, SEO specialist, branding korporat, konsultasi IT, dan dukungan teknis. Kami menyediakan solusi end-to-end untuk kebutuhan transformasi digital bisnis Anda.",
    category: "general",
  },
  {
    question: "Bagaimana cara memulai proyek dengan Genfity?",
    answer:
      "Untuk memulai proyek dengan kami, Anda dapat menghubungi kami melalui formulir kontak di website, email, atau WhatsApp. Tim kami akan segera merespons untuk mengatur konsultasi awal yang gratis. Dalam konsultasi ini, kami akan membahas kebutuhan Anda dan memberikan rekomendasi serta estimasi biaya yang sesuai.",
    category: "general",
  },
  {
    question: "Berapa biaya untuk layanan Genfity?",
    answer:
      "Biaya layanan kami bervariasi tergantung pada jenis proyek, kompleksitas, dan fitur yang dibutuhkan. Kami menawarkan paket dengan harga yang transparan dan dapat disesuaikan dengan kebutuhan dan anggaran Anda. Untuk mendapatkan penawaran yang akurat, silakan konsultasi gratis dengan tim kami.",
    category: "general",
  },
  {
    question: "Apakah saya akan mendapatkan hak cipta penuh atas proyek yang dikerjakan?",
    answer:
      "Ya, setelah proyek selesai dan pembayaran lunas, Anda akan mendapatkan hak cipta penuh atas semua aset digital yang dibuat khusus untuk Anda, termasuk website, sistem, desain, dan konten. Kami juga akan memberikan source code lengkap dan dokumentasi yang diperlukan.",
    category: "general",
  },

  // Website Development FAQs
  {
    question: "Berapa lama waktu yang dibutuhkan untuk membuat website kustom?",
    answer:
      "Waktu pengembangan website kustom bervariasi tergantung pada kompleksitas dan fitur yang diinginkan. Website landing page sederhana dapat selesai dalam 1-2 minggu, website bisnis dengan fitur standar membutuhkan 2-4 minggu, sementara website e-commerce atau sistem perusahaan yang kompleks dapat membutuhkan waktu 1-3 bulan.",
    category: "website",
  },
  {
    question: "Apakah saya akan mendapatkan domain dan hosting?",
    answer:
      "Ya, kami menyediakan paket lengkap yang mencakup domain dan hosting. Kami akan membantu Anda memilih nama domain yang sesuai dengan brand Anda dan menyediakan hosting yang cepat, aman, dan andal. Alternatifnya, kami juga dapat bekerja dengan domain dan hosting yang sudah Anda miliki sebelumnya.",
    category: "website",
  },
  {
    question: "Apakah website yang dibuat responsif untuk semua perangkat?",
    answer:
      "Tentu saja! Semua website yang kami kembangkan menggunakan pendekatan mobile-first dan sepenuhnya responsif. Website Anda akan tampil dan berfungsi dengan sempurna di desktop, tablet, dan smartphone. Kami melakukan testing menyeluruh pada berbagai ukuran layar dan browser.",
    category: "website",
  },
  {
    question: "Apakah saya bisa mengelola konten website sendiri?",
    answer:
      "Ya, kami akan menyediakan sistem manajemen konten (CMS) yang user-friendly sehingga Anda dapat dengan mudah memperbarui konten, menambah halaman baru, dan mengatur pengaturan website tanpa pengetahuan teknis. Kami juga menyediakan pelatihan dan dokumentasi lengkap.",
    category: "website",
  },

  // Design FAQs  
  {
    question: "Apa saja yang termasuk dalam layanan desain UI/UX?",
    answer:
      "Layanan UI/UX kami mencakup user research, competitor analysis, information architecture, wireframing, prototyping interaktif, visual design, design system creation, usability testing, dan iterasi berdasarkan feedback. Kami memastikan design tidak hanya menarik secara visual tetapi juga intuitif dan user-friendly.",
    category: "design",
  },
  {
    question: "Apakah desain yang dibuat mengikuti tren terkini?",
    answer:
      "Ya, tim designer kami selalu mengikuti perkembangan tren desain terkini sambil tetap mempertimbangkan aspek fungsionalitas dan user experience. Kami menggunakan modern design principles, micro-interactions, dan aesthetic yang contemporary namun timeless, sehingga design tidak cepat terlihat outdated.",
    category: "design",
  },
  {
    question: "Format file desain apa yang akan saya terima?",
    answer:
      "Untuk logo dan branding, Anda akan menerima file dalam format vector (AI, EPS, SVG) dan format raster resolusi tinggi (PNG, JPG). Untuk UI/UX design, Anda akan menerima file dalam format developer-ready (Figma, Sketch, atau XD) beserta semua aset yang diperlukan untuk development.",
    category: "design",
  },

  // WhatsApp & Marketing FAQs
  {
    question: "Apa manfaat menggunakan WhatsApp API untuk bisnis?",
    answer:
      "WhatsApp API memungkinkan bisnis berkomunikasi dengan pelanggan secara otomatis dan terstruktur. Manfaatnya antara lain: customer support 24/7, notifikasi order/pembayaran otomatis, marketing campaigns yang personal, integration dengan CRM, analytics yang detail, dan tingkat engagement yang tinggi karena WhatsApp memiliki open rate hingga 98%.",
    category: "marketing",
  },
  {
    question: "Berapa lama waktu untuk melihat hasil dari SEO?",
    answer:
      "SEO adalah investasi jangka panjang. Biasanya hasil awal terlihat dalam 3-6 bulan, dengan peningkatan signifikan dalam 6-12 bulan. Faktor yang mempengaruhi timeline adalah kondisi website saat ini, kompetisi keyword, kualitas content, dan konsistensi implementasi strategy. Kami menyediakan monthly reports untuk tracking progress.",
    category: "marketing",
  },
  {
    question: "Apakah Genfity menangani konten media sosial?",
    answer:
      "Ya, kami menawarkan layanan manajemen media sosial yang komprehensif, termasuk pembuatan konten, penjadwalan post, interaksi dengan audience, dan analisis performa. Kami akan bekerja sama dengan Anda untuk mengembangkan strategi konten yang selaras dengan brand dan target audience Anda.",
    category: "marketing",
  },

  // Pricing & Support FAQs
  {
    question: "Bagaimana struktur harga layanan Genfity?",
    answer:
      "Kami menawarkan struktur harga yang transparan dan fleksibel. Untuk project-based work, harga dihitung berdasarkan scope dan kompleksitas. Untuk ongoing services seperti maintenance atau digital marketing, kami menawarkan paket berlangganan bulanan. Semua quotation mencakup breakdown detail tanpa hidden costs.",
    category: "pricing",
  },
  {
    question: "Apa saja yang termasuk dalam layanan tech support?",
    answer:
      "Layanan tech support kami meliputi website maintenance, server monitoring, security updates, backup management, performance optimization, bug fixing, feature updates, technical troubleshooting, dan emergency support. Kami menawarkan berbagai paket support mulai dari basic maintenance hingga comprehensive managed services.",
    category: "support",
  },
  {
    question: "Bagaimana response time untuk tech support?",
    answer:
      "Response time bervariasi berdasarkan severity dan paket support. Untuk critical issues yang menyebabkan downtime, kami response dalam 1-2 jam. Non-critical issues biasanya response dalam 4-24 jam. Kami menyediakan different SLA levels tergantung kebutuhan bisnis, termasuk 24/7 support untuk enterprise clients.",
    category: "support",
  },
]

const categories = [
  { id: "general", name: "Umum", icon: HelpCircle },
  { id: "website", name: "Website", icon: Globe },
  { id: "design", name: "Desain UI/UX", icon: Paintbrush },
  { id: "marketing", name: "Marketing & WhatsApp", icon: MessageSquare },
  { id: "pricing", name: "Harga", icon: DollarSign },
  { id: "support", name: "Dukungan", icon: Headphones },
]

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<string>("general")
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
              Pertanyaan yang{" "}
              <span className="text-primary">
                Sering Diajukan
              </span>
            </h2>
            <p className="mb-8 sm:mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Temukan jawaban untuk pertanyaan umum tentang layanan digital kami, proses kerja, dan informasi perusahaan
            </p>
          </motion.div>
        </div>

        {/* Enhanced Category Tabs */}
        <motion.div 
          className="mb-8 sm:mb-10 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id)
                    setOpenItems([]) // Reset opened items when switching categories
                  }}
                  className={`group relative flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                      : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{category.name}</span>
                  
                  {/* Active indicator */}
                  {activeCategory === category.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-full -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

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
              Masih punya pertanyaan lain? Tim ahli kami siap membantu Anda!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-white text-sm sm:text-base transition-all duration-300 hover:bg-primary/90 hover:shadow-lg shadow-primary/25 w-full sm:w-auto justify-center"
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                Hubungi Kami
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-gray-700 dark:text-gray-200 text-sm sm:text-base transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md w-full sm:w-auto justify-center"
              >
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Lihat Semua FAQ
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
