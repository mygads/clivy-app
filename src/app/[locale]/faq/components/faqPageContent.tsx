"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Search, HelpCircle, Zap, MessageSquare, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input2"
import { Button } from "@/components/ui/button2"
import { Badge } from "@/components/ui/badge"

type FaqCategory = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

type FaqItem = {
  question: string
  answer: string
  category: string
  tags?: string[]
}

const categories: FaqCategory[] = [
  { 
    id: "whatsapp-api", 
    name: "WhatsApp API", 
    icon: MessageSquare,
    description: "Integrasi WhatsApp API untuk komunikasi dan engagement pelanggan"
  },
  { 
    id: "whatsapp-broadcast", 
    name: "WhatsApp Broadcast", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22,2 15,22 11,13 2,9 22,2"/>
      </svg>
    ),
    description: "Solusi pesan massal yang efisien untuk kampanye promosi tertarget"
  },
  { 
    id: "whatsapp-chatbot", 
    name: "WhatsApp Chatbot AI", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="10" r="1"/>
        <circle cx="16" cy="10" r="1"/>
        <circle cx="8" cy="10" r="1"/>
      </svg>
    ),
    description: "Chatbot bertenaga AI untuk layanan pelanggan otomatis 24/7"
  }
]

const faqItems: FaqItem[] = [
  // WhatsApp API FAQs
  {
    question: "Apa manfaat menggunakan WhatsApp API untuk bisnis?",
    answer:
      "WhatsApp API memungkinkan bisnis berkomunikasi dengan pelanggan secara otomatis dan terstruktur. Manfaatnya antara lain: customer support 24/7, notifiksasi order/pembayaran otomatis, marketing campaigns yang personal, integration dengan CRM, analytics yang detail, dan tingkat engagement yang tinggi karena WhatsApp memiliki open rate hingga 98%.",
    category: "whatsapp-api",
    tags: ["api", "automation", "business communication"]
  },
  {
    question: "Apakah WhatsApp API berbeda dengan WhatsApp Business biasa?",
    answer:
      "Ya, WhatsApp API lebih advanced dari WhatsApp Business. API memungkinkan integrasi dengan sistem existing, automation yang kompleks, handling volume pesan yang besar, template messages untuk broadcast, webhook untuk real-time notifications, dan analytics yang komprehensif. WhatsApp Business lebih cocok untuk usaha kecil dengan volume komunikasi terbatas.",
    category: "whatsapp-api",
    tags: ["business benefits", "high engagement", "automation"]
  },
  {
    question: "Apakah penggunaan WhatsApp API sesuai dengan regulasi yang berlaku?",
    answer:
      "Ya, WhatsApp API yang kami implementasikan sepenuhnya compliant dengan regulasi WhatsApp dan standar privasi data internasional. Kami memastikan opt-in consent dari pengguna, mengikuti template message guidelines, dan menerapkan best practices untuk mencegah spam. Semua implementasi mengikuti WhatsApp Business Policy yang berlaku.",
    category: "whatsapp-api",
    tags: ["legal", "official", "secure", "compliance"]
  },

  // WhatsApp Broadcast FAQs
  {
    question: "Apa itu WhatsApp Broadcast dan bagaimana cara kerjanya?",
    answer:
      "WhatsApp Broadcast adalah fitur untuk mengirim pesan ke multiple contacts sekaligus namun penerima melihatnya sebagai pesan personal. Berbeda dengan grup, broadcast memastikan privasi karena penerima tidak bisa melihat siapa saja yang menerima pesan yang sama. Ini sangat efektif untuk campaign marketing, announcement, atau updates bisnis.",
    category: "whatsapp-broadcast",
    tags: ["compliance", "opt-in", "best practices"]
  },
  {
    question: "Berapa batas maksimal kontak untuk WhatsApp Broadcast?",
    answer:
      "WhatsApp Business memiliki limit 256 kontak per broadcast list. Namun dengan WhatsApp Business API yang kami integrasikan, Anda dapat mengirim pesan ke ribuan bahkan jutaan kontak dengan menggunakan template messages yang telah diapprove WhatsApp. Kami membantu setup dan management campaign broadcast yang legal dan compliant.",
    category: "whatsapp-broadcast",
    tags: ["volume", "limits", "scaling"]
  },
  {
    question: "Bagaimana cara mengoptimalkan performa WhatsApp Broadcast untuk SEO?",
    answer:
      "Meskipun WhatsApp Broadcast tidak langsung mempengaruhi SEO, Anda dapat mengoptimalkannya dengan mengarahkan traffic ke website melalui link dalam pesan, menggunakan call-to-action yang mendorong engagement di website, dan mengintegrasikan dengan strategi content marketing. Kami juga dapat membantu tracking konversi dari broadcast ke website untuk analisis ROI yang lebih akurat.",
    category: "whatsapp-broadcast",
    tags: ["seo optimization", "performance", "search engine"]
  },

  // WhatsApp Chatbot FAQs
  {
    question: "Bagaimana WhatsApp Chatbot AI dapat membantu bisnis saya?",
    answer:
      "Chatbot AI dapat menangani customer inquiries 24/7, memberikan response yang cepat dan konsisten, mengkualifikasi leads, memproses order sederhana, menjadwalkan appointment, dan memberikan informasi produk/layanan. Dengan AI yang semakin canggih, chatbot dapat memahami context dan memberikan jawaban yang natural seperti manusia.",
    category: "whatsapp-chatbot",
    tags: ["ai", "nlp", "machine learning", "automation"]
  },
  {
    question: "Apakah chatbot dapat disesuaikan dengan kebutuhan bisnis spesifik?",
    answer:
      "Absolut! Kami mengembangkan chatbot yang fully customizable sesuai dengan brand voice, product knowledge, business process, dan customer journey Anda. Chatbot dapat diintegrasikan dengan database produk, sistem inventory, CRM, dan tools bisnis lainnya untuk memberikan informasi yang akurat dan real-time.",
    category: "whatsapp-chatbot",
    tags: ["customization", "business-specific", "integration"]
  },
  {
    question: "Bagaimana chatbot menangani pertanyaan yang tidak bisa dijawab?",
    answer:
      "Chatbot kami dilengkapi dengan intelligent fallback system yang dapat mengenali ketika pertanyaan di luar kemampuannya. Dalam situasi ini, chatbot akan secara otomatis mengarahkan conversation ke human agent atau menyediakan alternatif jawaban. Kami juga implementasi continuous learning sehingga chatbot semakin pintar dari interaksi sebelumnya.",
    category: "whatsapp-chatbot",
    tags: ["human-bot collaboration", "intelligent routing", "customer service"]
  }
]

export default function FaqPageContent() {
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [openItems, setOpenItems] = useState<number[]>([])

  // Get current category data
  const currentCategory = categories.find(cat => cat.id === activeCategory)
  const allCategory = {
    name: "Semua FAQ",
    description: "Tampilkan semua pertanyaan dari semua kategori",
    icon: HelpCircle
  }

  // Filter FAQs based on search query and active category
  const filteredFaqs = faqItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesCategory = activeCategory === "all" || item.category === activeCategory

    return matchesSearch && matchesCategory
  })

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden dark:bg-dark mt-20 pt-12 sm:pt-16 md:pt-20 lg:pt-24">
        {/* Background Pattern - Responsive */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 bg-primary/20 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 w-20 h-20 sm:w-40 sm:h-40 bg-blue-500/20 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-60 sm:h-60 bg-purple-500/10 rounded-full blur-2xl sm:blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>


              {/* Main Title - More Responsive */}
              <motion.h1 
                className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Pertanyaan yang{" "}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Sering Diajukan
                </span>
              </motion.h1>

              {/* Subtitle - More Responsive */}
              <motion.p 
                className="mb-8 sm:mb-10 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Temukan jawaban komprehensif untuk pertanyaan umum tentang integrasi WhatsApp API, layanan broadcast, dan chatbot AI untuk bisnis Anda
              </motion.p>

              {/* Enhanced Search Bar - More Responsive */}
              <motion.div 
                className="mx-auto max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="relative group">
                  {/* Search Icon */}
                  <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors duration-300 z-10" />
                  
                  {/* Input Field */}
                  <Input
                    type="text"
                    placeholder="Cari pertanyaan tentang WhatsApp API..."
                    className="w-full h-12 sm:h-14 rounded-2xl border-2 border-gray-200 dark:border-gray-700 pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base focus:border-primary focus:ring-primary/20 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  {/* Search Button */}
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors duration-200"
                      onClick={() => {
                        // Focus will trigger search automatically due to filtered results
                      }}
                    >
                      Cari
                    </motion.button>
                  )}
                </div>
                
                {/* Search Stats */}
                <motion.div 
                  className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <span className="font-medium">{faqItems.length}+ pertanyaan</span> tersedia dalam <span className="font-medium">{categories.length} kategori</span> WhatsApp
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Category Selector */}
            <div className="mb-8 sm:mb-10">
              <div className="mb-4 sm:mb-6">
                <label className="mb-3 sm:mb-4 block text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Filter berdasarkan Kategori:
                </label>
                <Select value={activeCategory} onValueChange={setActiveCategory}>
                  <SelectTrigger className="w-full max-w-2xl h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-gray-200 dark:border-gray-700 hover:border-primary focus:border-primary transition-all duration-300 rounded-xl shadow-sm hover:shadow-md bg-white dark:bg-gray-900/80 backdrop-blur-sm">
                    <SelectValue>
                      <div className="flex items-center gap-2 sm:gap-3 py-1">
                        {currentCategory ? (
                          <>
                            <currentCategory.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-white flex-shrink-0" />
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{currentCategory.name}</div>
                              <div className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 leading-tight truncate">
                                {currentCategory.description}
                              </div>
                            </div>
                          </>
                        ) : activeCategory === "all" ? (
                          <>
                            <allCategory.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-white flex-shrink-0" />
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">{allCategory.name}</div>
                              <div className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 leading-tight">
                                {allCategory.description}
                              </div>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-500">Pilih Kategori</span>
                        )}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent 
                    className="max-w-sm sm:max-w-xl max-h-64 sm:max-h-80 overflow-y-auto border-2 border-gray-200 dark:border-gray-700 shadow-xl rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
                    side="bottom"
                    align="start"
                    sideOffset={8}
                  >
                    <SelectItem value="all" className="p-3 sm:p-4 cursor-pointer hover:bg-primary/10 focus:bg-primary/10 rounded-lg transition-colors duration-200">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <allCategory.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-white flex-shrink-0" />
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{allCategory.name}</div>
                            <div className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 leading-tight truncate">
                              {allCategory.description}
                            </div>
                          </div>
                        </div>
                        {activeCategory === "all" && (
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary dark:text-white flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="p-3 sm:p-4 cursor-pointer hover:bg-primary/10 focus:bg-primary/10 rounded-lg transition-colors duration-200">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <category.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-white flex-shrink-0" />
                            <div className="text-left min-w-0 flex-1">
                              <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{category.name}</div>
                              <div className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 leading-tight truncate">
                                {category.description}
                              </div>
                            </div>
                          </div>
                          {activeCategory === category.id && (
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary dark:text-blue-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-6 sm:h-8 w-1 bg-primary rounded-full"></div>
                  <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                    Menampilkan {filteredFaqs.length} pertanyaan
                    {activeCategory !== "all" && currentCategory && (
                      <span className="hidden sm:inline"> dalam kategori &ldquo;{currentCategory.name}&rdquo;</span>
                    )}
                    {searchQuery && (
                      <span className="hidden sm:inline"> untuk pencarian &ldquo;{searchQuery}&rdquo;</span>
                    )}
                  </p>
                </div>
                {(searchQuery || activeCategory !== "all") && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setActiveCategory("all")
                    }}
                    className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>

            {/* FAQ Items */}
            <motion.div
              key={`${activeCategory}-${searchQuery}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <FaqItem
                    key={`${activeCategory}-${index}`}
                    faq={faq}
                    index={index}
                    isOpen={openItems.includes(index)}
                    toggleItem={toggleItem}
                  />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 sm:mt-12 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 p-6 sm:p-8 md:p-12 text-center backdrop-blur-sm"
                >
                  <div className="mx-auto max-w-md">
                    <Search className="mx-auto mb-4 sm:mb-6 h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500" />
                    <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">
                      Tidak ada hasil yang ditemukan
                    </h3>
                    <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                      Coba ubah filter kategori atau gunakan kata kunci pencarian yang berbeda
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSearchQuery("")
                          setActiveCategory("all")
                        }}
                        className="w-full sm:w-auto"
                      >
                        Reset Filter
                      </Button>
                      <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
                        <Link href="/contact">Hubungi Kami</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Contact CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-12 sm:mt-16 md:mt-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/30 dark:from-primary/20 dark:via-gray-800 dark:to-gray-900 p-6 sm:p-8 md:p-12 text-center border border-primary/10"
            >
              <div className="mx-auto max-w-2xl">
                <Zap className="mx-auto mb-4 sm:mb-6 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
                <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Masih punya pertanyaan?
                </h3>
                <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi tim ahli kami. 
                  Kami siap membantu dengan solusi WhatsApp API yang tepat untuk pertumbuhan bisnis Anda.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row">
                  <Button asChild size="default" className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold dark:text-white">
                    <Link href="/contact">
                      <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5 " />
                      Hubungi Kami
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="default" className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold border-gray-300 dark:border-gray-600 dark:text-gray-200">
                    <Link href="/products">
                      Lihat Paket WhatsApp API
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

// FAQ Item Component
function FaqItem({
  faq,
  index,
  isOpen,
  toggleItem,
}: {
  faq: FaqItem
  index: number
  isOpen: boolean
  toggleItem: (index: number) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
    >
      <button
        onClick={() => toggleItem(index)}
        className="flex w-full items-center justify-between px-4 sm:px-6 py-2 sm:py-3 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white pr-3 sm:pr-4 leading-relaxed">
          {faq.question}
        </h3>
        <ChevronDown
          className={`h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[1000px] px-4 sm:px-6 pb-4 sm:pb-6" : "max-h-0"
        }`}
      >
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4">
            {faq.answer}
          </p>
          {faq.tags && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {faq.tags.slice(0, 3).map((tag, tagIndex) => (
                <Badge 
                  key={tagIndex} 
                  className="text-xs px-2 py-1 
                    bg-blue-50 text-blue-700 border border-blue-200 
                    hover:bg-blue-100 hover:text-blue-800
                    dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 
                    dark:hover:bg-slate-600 dark:hover:text-white
                    transition-all duration-200 font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}