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
    id: "general", 
    name: "Umum", 
    icon: HelpCircle,
    description: "Pertanyaan dasar tentang Clivy dan layanan kami"
  },
  { 
    id: "custom-website", 
    name: "Pengembangan Website Kustom", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    description: "Website yang dirancang khusus sesuai kebutuhan bisnis Anda"
  },
  { 
    id: "web-app", 
    name: "Pengembangan Aplikasi Web", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    description: "Aplikasi web modern dan skalabel dengan teknologi terdepan"
  },
  { 
    id: "mobile-development", 
    name: "Pengembangan Mobile", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    description: "Aplikasi mobile native dan cross-platform untuk iOS dan Android"
  },
  { 
    id: "corporate-system", 
    name: "Sistem Korporat", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
      </svg>
    ),
    description: "Sistem manajemen enterprise dan otomatisasi proses bisnis"
  },
  { 
    id: "ui-ux-design", 
    name: "Desain UI/UX", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/>
        <circle cx="11" cy="11" r="2"/>
      </svg>
    ),
    description: "Desain yang berfokus pada pengguna dengan estetika dan fungsionalitas optimal"
  },
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
  },
  { 
    id: "seo-specialist", 
    name: "Spesialis SEO", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
      </svg>
    ),
    description: "Optimisasi mesin pencari untuk meningkatkan visibilitas website"
  },
  { 
    id: "corporate-branding", 
    name: "Branding Korporat", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
        <polyline points="10,9 10,11 14,11 14,9"/>
      </svg>
    ),
    description: "Pengembangan identitas merek dan positioning strategis"
  },
  { 
    id: "it-consulting", 
    name: "Konsultasi IT", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    description: "Konsultasi teknologi strategis dan transformasi digital"
  },
  { 
    id: "tech-support", 
    name: "Dukungan Teknis", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    ),
    description: "Bantuan teknis dan layanan pemeliharaan yang andal"
  },
  { 
    id: "pricing-payment", 
    name: "Harga & Pembayaran", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    description: "Informasi tentang harga layanan dan metode pembayaran"
  },
  { 
    id: "process", 
    name: "Proses Kerja", 
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    description: "Tahapan dan metodologi kerja dalam proyek"
  }
]

const faqItems: FaqItem[] = [
  // General FAQs
  {
    question: "Layanan apa saja yang ditawarkan oleh Clivy?",
    answer:
      "Clivy menawarkan berbagai layanan digital yang komprehensif, meliputi pengembangan website kustom, aplikasi web dan mobile, sistem korporat, desain UI/UX, WhatsApp API solutions, SEO specialist, branding korporat, konsultasi IT, dan dukungan teknis. Kami menyediakan solusi end-to-end untuk kebutuhan transformasi digital bisnis Anda.",
    category: "general",
    tags: ["layanan", "digital", "website", "mobile", "api"]
  },
  {
    question: "Bagaimana cara memulai proyek dengan Clivy?",
    answer:
      "Untuk memulai proyek dengan kami, Anda dapat menghubungi kami melalui formulir kontak di website, email, atau WhatsApp. Tim kami akan segera merespons untuk mengatur konsultasi awal yang gratis. Dalam konsultasi ini, kami akan membahas kebutuhan Anda, menjawab pertanyaan, dan memberikan rekomendasi serta estimasi biaya yang sesuai dengan anggaran Anda.",
    category: "general",
    tags: ["konsultasi", "kontak", "memulai proyek"]
  },
  {
    question: "Berapa biaya untuk layanan Clivy?",
    answer:
      "Biaya layanan kami bervariasi tergantung pada jenis proyek, kompleksitas, dan fitur yang dibutuhkan. Kami menawarkan paket dengan harga yang transparan dan dapat disesuaikan dengan kebutuhan dan anggaran Anda. Untuk mendapatkan penawaran yang akurat, silakan kunjungi halaman produk kami atau konsultasi gratis dengan tim kami.",
    category: "general",
    tags: ["harga", "biaya", "paket", "pricing"]
  },
  {
    question: "Apakah Clivy melayani klien dari luar kota atau luar negeri?",
    answer:
      "Ya, kami melayani klien dari seluruh Indonesia dan juga Australia. Tim kami berlokasi di Indonesia dan Australia, sehingga kami dapat melayani klien dengan zona waktu yang berbeda. Dengan memanfaatkan teknologi komunikasi modern seperti video conference, email, dan platform manajemen proyek, kami dapat bekerja sama secara efektif dengan klien dari mana saja.",
    category: "general",
    tags: ["internasional", "remote", "australia", "indonesia"]
  },
  {
    question: "Apakah saya akan mendapatkan hak cipta penuh atas proyek yang dikerjakan?",
    answer:
      "Ya, setelah proyek selesai dan pembayaran lunas, Anda akan mendapatkan hak cipta penuh atas semua aset digital yang dibuat khusus untuk Anda, termasuk website, sistem, desain, dan konten (kecuali elemen berlisensi pihak ketiga yang digunakan dengan izin). Kami juga akan memberikan source code lengkap dan dokumentasi yang diperlukan.",
    category: "general",
    tags: ["hak cipta", "ownership", "source code"]
  },
  {
    question: "Apa yang membedakan Clivy dengan penyedia layanan digital lainnya?",
    answer:
      "Clivy memiliki keunggulan dalam pengalaman tim yang berpengalaman di pasar internasional (Australia dan Indonesia), teknologi terdepan, dan pendekatan yang disesuaikan untuk setiap klien. Kami tidak hanya membangun produk digital, tetapi juga memastikan strategi yang tepat untuk pertumbuhan bisnis jangka panjang Anda. Tim kami juga menyediakan dukungan berkelanjutan setelah proyek selesai.",
    category: "general",
    tags: ["keunggulan", "differensiasi", "internasional"]
  },

  // Custom Website Development FAQs
  {
    question: "Berapa lama waktu yang dibutuhkan untuk membuat website kustom?",
    answer:
      "Waktu pengembangan website kustom bervariasi tergantung pada kompleksitas dan fitur yang diinginkan. Website landing page sederhana dapat selesai dalam 1-2 minggu, website bisnis dengan fitur standar membutuhkan 2-4 minggu, sementara website e-commerce atau sistem perusahaan yang kompleks dapat membutuhkan waktu 1-3 bulan. Kami akan memberikan timeline yang jelas setelah analisis kebutuhan awal.",
    category: "custom-website",
    tags: ["timeline", "development", "estimasi"]
  },
  {
    question: "Apa saja yang termasuk dalam layanan pengembangan website kustom?",
    answer:
      "Layanan kami mencakup konsultasi kebutuhan, desain UI/UX, pengembangan frontend dan backend, integrasi database, sistem manajemen konten (CMS), optimisasi SEO dasar, testing dan quality assurance, deployment, pelatihan penggunaan, dan dokumentasi. Kami juga menyediakan garansi bug-fixing selama 3 bulan setelah peluncuran.",
    category: "custom-website",
    tags: ["fitur", "layanan", "komprehensif"]
  },
  {
    question: "Apakah saya akan mendapatkan domain dan hosting?",
    answer:
      "Ya, kami menyediakan paket lengkap yang mencakup domain dan hosting. Kami akan membantu Anda memilih nama domain yang sesuai dengan brand Anda dan menyediakan hosting yang cepat, aman, dan andal. Alternatifnya, kami juga dapat bekerja dengan domain dan hosting yang sudah Anda miliki sebelumnya.",
    category: "custom-website",
    tags: ["domain", "hosting", "deployment"]
  },
  {
    question: "Apakah website yang dibuat responsif untuk semua perangkat?",
    answer:
      "Tentu saja! Semua website yang kami kembangkan menggunakan pendekatan mobile-first dan sepenuhnya responsif. Website Anda akan tampil dan berfungsi dengan sempurna di desktop, tablet, dan smartphone. Kami melakukan testing menyeluruh pada berbagai ukuran layar dan browser untuk memastikan pengalaman pengguna yang optimal di semua perangkat.",
    category: "custom-website",
    tags: ["responsive", "mobile", "testing"]
  },

  // Web App Development FAQs
  {
    question: "Apa perbedaan antara website statis dan aplikasi web dinamis?",
    answer:
      "Website statis memiliki konten yang tetap dan cocok untuk company profile atau landing page. Aplikasi web dinamis memiliki konten yang dapat berubah secara otomatis atau manual, dilengkapi dengan database dan sistem manajemen konten. Aplikasi web lebih cocok untuk e-commerce, blog, portal berita, atau sistem yang memerlukan interaksi pengguna yang kompleks.",
    category: "web-app",
    tags: ["perbedaan", "fungsionalitas", "kompleksitas"]
  },
  {
    question: "Teknologi apa yang digunakan untuk mengembangkan aplikasi web?",
    answer:
      "Kami menggunakan teknologi modern seperti React.js, Next.js, Node.js, TypeScript, dan database PostgreSQL atau MongoDB. Untuk CMS, kami dapat menggunakan WordPress, Strapi, atau membangun sistem custom sesuai kebutuhan. Semua teknologi yang kami pilih mengutamakan keamanan, performa, dan skalabilitas.",
    category: "web-app",
    tags: ["teknologi", "modern", "scalable"]
  },
  {
    question: "Berapa lama waktu yang dibutuhkan untuk mengembangkan aplikasi web?",
    answer:
      "Waktu pengembangan aplikasi web tergantung pada kompleksitas fitur dan integrations yang dibutuhkan. Aplikasi web sederhana dapat selesai dalam 4-8 minggu, aplikasi dengan fitur menengah membutuhkan 2-4 bulan, sedangkan aplikasi enterprise yang kompleks dapat membutuhkan 4-8 bulan. Kami menggunakan metodologi Agile untuk memastikan delivery yang tepat waktu.",
    category: "web-app",
    tags: ["timeline", "development", "planning"]
  },
  {
    question: "Apakah saya bisa mengelola konten aplikasi web sendiri?",
    answer:
      "Ya, kami akan menyediakan sistem manajemen konten (CMS) yang user-friendly sehingga Anda dapat dengan mudah memperbarui konten, menambah halaman baru, mengelola produk (untuk e-commerce), dan mengatur pengaturan aplikasi tanpa pengetahuan teknis. Kami juga menyediakan pelatihan dan dokumentasi lengkap.",
    category: "web-app",
    tags: ["cms", "content management", "user-friendly"]
  },

  // Mobile Development FAQs
  {
    question: "Apakah Clivy mengembangkan aplikasi untuk iOS dan Android?",
    answer:
      "Ya, kami mengembangkan aplikasi mobile untuk platform iOS dan Android. Kami menawarkan dua pendekatan: native development (Swift untuk iOS, Kotlin untuk Android) untuk performa maksimal, atau cross-platform development (React Native, Flutter) untuk efisiensi waktu dan biaya dengan tetap mempertahankan kualitas tinggi.",
    category: "mobile-development",
    tags: ["native", "cross-platform", "ios", "android"]
  },
  {
    question: "Apa perbedaan antara aplikasi native dan cross-platform?",
    answer:
      "Aplikasi native dikembangkan khusus untuk satu platform dengan bahasa pemrograman asli, memberikan performa terbaik dan akses penuh ke fitur device. Cross-platform menggunakan satu codebase untuk kedua platform, lebih efisien dari segi waktu dan biaya. Kami akan merekomendasikan pendekatan terbaik berdasarkan kebutuhan dan anggaran Anda.",
    category: "mobile-development",
    tags: ["native vs cross-platform", "performa", "budget"]
  },
  {
    question: "Berapa lama waktu pengembangan aplikasi mobile?",
    answer:
      "Waktu pengembangan bervariasi: aplikasi sederhana 2-3 bulan, aplikasi dengan fitur menengah 3-6 bulan, dan aplikasi kompleks 6-12 bulan. Faktor yang mempengaruhi adalah kompleksitas UI/UX, jumlah fitur, integrasi dengan sistem external, dan proses testing. Kami akan memberikan timeline detail setelah analisis requirement.",
    category: "mobile-development",
    tags: ["timeline", "development time", "planning"]
  },
  {
    question: "Apakah Clivy membantu proses publishing ke App Store dan Play Store?",
    answer:
      "Ya, kami membantu seluruh proses publikasi aplikasi ke App Store dan Google Play Store, termasuk persiapan metadata, screenshot, ikon, deskripsi aplikasi, dan handling review process. Kami juga memberikan panduan untuk App Store Optimization (ASO) agar aplikasi Anda lebih mudah ditemukan oleh pengguna.",
    category: "mobile-development",
    tags: ["app store", "google play", "publishing", "aso"]
  },
  {
    question: "Bagaimana keamanan aplikasi mobile yang dikembangkan?",
    answer:
      "Kami menerapkan praktik keamanan terbaik seperti enkripsi data, secure API communication, authentication yang kuat, code obfuscation, dan protection terhadap common vulnerabilities. Untuk aplikasi yang menangani data sensitif, kami juga implementasi additional security layers seperti biometric authentication dan advanced encryption.",
    category: "mobile-development",
    tags: ["security", "ssl", "protection"]
  },

  // Corporate System FAQs
  {
    question: "Jenis sistem korporat apa saja yang dapat dikembangkan Clivy?",
    answer:
      "Kami mengembangkan berbagai sistem enterprise seperti ERP (Enterprise Resource Planning), CRM (Customer Relationship Management), HRM (Human Resource Management), sistem inventory management, financial management system, project management tools, document management system, dan sistem custom sesuai kebutuhan spesifik perusahaan Anda.",
    category: "corporate-system",
    tags: ["erp", "crm", "hrm", "enterprise"]
  },
  {
    question: "Apakah sistem dapat diintegrasikan dengan software existing?",
    answer:
      "Ya, kami memiliki expertise dalam integrasi sistem dengan software existing seperti sistem akuntansi, payment gateway, third-party APIs, cloud services, dan legacy systems. Kami menggunakan modern integration techniques dan APIs untuk memastikan data flow yang seamless antar systems.",
    category: "corporate-system",
    tags: ["integration", "api", "existing systems"]
  },
  {
    question: "Bagaimana keamanan data dalam sistem korporat?",
    answer:
      "Keamanan data adalah prioritas utama. Kami implementasi multi-layer security termasuk encryption at rest dan in transit, role-based access control, audit trails, regular security updates, backup automation, dan compliance dengan standar keamanan industri seperti ISO 27001. Untuk kebutuhan khusus, kami juga menyediakan on-premise deployment.",
    category: "corporate-system",
    tags: ["data security", "enterprise", "compliance"]
  },

  // UI/UX Design FAQs
  {
    question: "Apa yang termasuk dalam layanan desain UI/UX?",
    answer:
      "Layanan UI/UX kami mencakup user research, competitor analysis, information architecture, wireframing, prototyping interaktif, visual design, design system creation, usability testing, dan iterasi berdasarkan feedback. Kami memastikan design tidak hanya menarik secara visual tetapi juga intuitif dan user-friendly.",
    category: "ui-ux-design",
    tags: ["user research", "prototyping", "design system"]
  },
  {
    question: "Bagaimana proses desain UI/UX di Clivy?",
    answer:
      "Proses kami dimulai dengan research pengguna dan analisis kompetitor, kemudian membuat wireframe dan user flow, dilanjutkan dengan desain visual dan prototyping. Kami melakukan testing dengan pengguna untuk validasi dan iterasi design. Semua tahap melibatkan kolaborasi erat dengan klien untuk memastikan hasil yang sesuai dengan ekspektasi.",
    category: "ui-ux-design",
    tags: ["design process", "user-centered", "iterative"]
  },
  {
    question: "Apakah desain yang dibuat mengikuti tren terkini?",
    answer:
      "Ya, tim designer kami selalu mengikuti perkembangan tren desain terkini sambil tetap mempertimbangkan aspek fungsionalitas dan user experience. Kami menggunakan modern design principles, micro-interactions, dan aesthetic yang contemporary namun timeless, sehingga design tidak cepat terlihat outdated.",
    category: "ui-ux-design",
    tags: ["modern technology", "react", "nextjs", "cms"]
  },

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
  },

  // SEO Specialist FAQs
  {
    question: "Layanan SEO apa saja yang ditawarkan Clivy?",
    answer:
      "Layanan SEO kami meliputi technical SEO audit, keyword research dan strategy, on-page optimization, content optimization, link building, local SEO, e-commerce SEO, dan SEO monitoring & reporting. Kami menggunakan tools professional seperti Ahrefs, SEMrush, dan Google Search Console untuk analisis yang mendalam.",
    category: "seo-specialist",
    tags: ["seo audit", "keyword research", "optimization"]
  },
  {
    question: "Berapa lama waktu untuk melihat hasil dari SEO?",
    answer:
      "SEO adalah investasi jangka panjang. Biasanya hasil awal terlihat dalam 3-6 bulan, dengan peningkatan signifikan dalam 6-12 bulan. Faktor yang mempengaruhi timeline adalah kondisi website saat ini, kompetisi keyword, kualitas content, dan konsistensi implementasi strategy. Kami menyediakan monthly reports untuk tracking progress.",
    category: "seo-specialist",
    tags: ["timeline", "results", "long-term strategy"]
  },
  {
    question: "Apakah layanan SEO dapat disesuaikan dengan budget yang terbatas?",
    answer:
      "Ya, kami menawarkan paket SEO yang fleksibel dan dapat disesuaikan dengan budget Anda. Mulai dari basic SEO audit dan optimization hingga comprehensive SEO campaign. Kami akan memprioritaskan strategy yang memberikan ROI terbaik sesuai dengan budget yang tersedia, sehingga Anda tetap mendapatkan hasil yang optimal.",
    category: "seo-specialist",
    tags: ["scalable", "future-proof", "maintenance"]
  },

  // Pricing & Payment FAQs
  {
    question: "Bagaimana struktur harga layanan Clivy?",
    answer:
      "Kami menawarkan struktur harga yang transparan dan fleksibel. Untuk project-based work, harga dihitung berdasarkan scope dan kompleksitas. Untuk ongoing services seperti maintenance atau digital marketing, kami menawarkan paket berlangganan bulanan. Semua quotation mencakup breakdown detail tanpa hidden costs.",
    category: "pricing-payment",
    tags: ["flexible pricing", "payment options", "milestones"]
  },
  {
    question: "Metode pembayaran apa saja yang diterima?",
    answer:
      "Kami menerima berbagai metode pembayaran untuk kemudahan klien: transfer bank (IDR dan AUD), kartu kredit/debit, PayPal, dan payment gateway lokal seperti GoPay, OVO, Dana. Untuk project besar, kami juga menawarkan payment terms yang fleksibel dengan milestone-based payments.",
    category: "pricing-payment",
    tags: ["transparent pricing", "no hidden costs", "detailed proposal"]
  },
  {
    question: "Apakah ada paket bundling untuk multiple services?",
    answer:
      "Ya, kami menawarkan paket bundling yang cost-effective untuk klien yang membutuhkan multiple services. Misalnya paket 'Digital Transformation' yang mencakup website development, mobile app, dan digital marketing. Paket bundling biasanya memberikan savings 15-25% dibanding mengambil services secara terpisah.",
    category: "pricing-payment",
    tags: ["bundle package", "cost-effective", "enterprise"]
  },

  // Corporate Branding FAQs
  {
    question: "Apa yang termasuk dalam layanan corporate branding?",
    answer:
      "Layanan branding kami mencakup brand strategy development, logo design, visual identity system, brand guidelines, marketing collateral design, website branding, social media branding, packaging design, dan brand implementation across all touchpoints. Kami memastikan konsistensi brand di semua platform dan material komunikasi.",
    category: "corporate-branding",
    tags: ["brand strategy", "logo design", "brand identity"]
  },
  {
    question: "Berapa lama proses pengembangan brand identity?",
    answer:
      "Proses branding komprehensif biasanya membutuhkan 4-8 minggu, tergantung scope dan kompleksitas. Tahapan meliputi brand discovery (1-2 minggu), concept development (2-3 minggu), design refinement (1-2 minggu), dan finalization dengan brand guidelines (1 minggu). Kami melibatkan klien dalam setiap tahap untuk memastikan hasil yang sesuai visi.",
    category: "corporate-branding",
    tags: ["timeline", "brand development", "design process"]
  },

  // IT Consulting FAQs
  {
    question: "Jenis konsultasi IT apa yang disediakan Clivy?",
    answer:
      "Kami menyediakan konsultasi digital transformation strategy, technology audit dan assessment, sistem architecture planning, cloud migration strategy, cybersecurity assessment, IT infrastructure optimization, software selection guidance, dan technology roadmap development. Konsultasi kami membantu businesses make informed technology decisions.",
    category: "it-consulting",
    tags: ["digital transformation", "technology strategy", "consulting"]
  },
  {
    question: "Bagaimana konsultasi IT disesuaikan dengan kebutuhan bisnis?",
    answer:
      "Kami memulai dengan comprehensive business analysis untuk memahami goals, challenges, dan current technology landscape Anda. Berdasarkan findings ini, kami develop customized recommendations yang align dengan business objectives, budget constraints, dan timeline. Setiap saran dilengkapi dengan ROI analysis dan implementation roadmap yang praktis.",
    category: "it-consulting",
    tags: ["target audience", "business needs", "optimization"]
  },

  // Tech Support FAQs
  {
    question: "Apa saja yang termasuk dalam layanan tech support?",
    answer:
      "Layanan tech support kami meliputi website maintenance, server monitoring, security updates, backup management, performance optimization, bug fixing, feature updates, technical troubleshooting, dan emergency support. Kami menawarkan berbagai paket support mulai dari basic maintenance hingga comprehensive managed services.",
    category: "tech-support",
    tags: ["maintenance", "monitoring", "emergency support"]
  },
  {
    question: "Bagaimana response time untuk tech support?",
    answer:
      "Response time bervariasi berdasarkan severity dan paket support. Untuk critical issues yang menyebabkan downtime, kami response dalam 1-2 jam. Non-critical issues biasanya response dalam 4-24 jam. Kami menyediakan different SLA levels tergantung kebutuhan bisnis, termasuk 24/7 support untuk enterprise clients.",
    category: "tech-support",
    tags: ["response time", "sla", "priority support"]
  },

  // Process FAQs
  {
    question: "Bagaimana alur kerja project di Clivy?",
    answer:
      "Alur kerja kami terstruktur: 1) Discovery & consultation untuk memahami requirements, 2) Proposal & planning dengan timeline jelas, 3) Design & development dengan regular check-ins, 4) Testing & quality assurance, 5) Deployment & launch, 6) Training & handover, 7) Post-launch support. Setiap tahap melibatkan client feedback untuk memastikan hasil sesuai ekspektasi.",
    category: "process",
    tags: ["project workflow", "methodology", "client involvement"]
  },
  {
    question: "Seberapa sering update progress diberikan?",
    answer:
      "Kami memberikan weekly progress updates melalui email dan project management tools. Untuk milestone penting, kami schedule review meetings via video call. Client memiliki akses 24/7 ke project dashboard untuk tracking real-time progress. Komunikasi yang transparent dan regular adalah kunci kesuksesan project.",
    category: "process",
    tags: ["communication", "project management", "regular updates"]
  },
  {
    question: "Bagaimana jika ada perubahan requirement di tengah project?",
    answer:
      "Change requests adalah hal normal dalam development process. Untuk perubahan minor dalam scope yang sama, biasanya tidak ada additional cost. Untuk perubahan significant atau penambahan fitur baru, kami will assess impact terhadap timeline dan budget, kemudian discuss dengan client sebelum implementasi. Fleksibilitas dalam reasonable bounds adalah prioritas kami.",
    category: "process",
    tags: ["change management", "scope changes", "project flexibility"]
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
                Temukan jawaban komprehensif untuk pertanyaan umum tentang layanan digital kami, proses kerja, harga, dan informasi perusahaan
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
                    placeholder="Cari pertanyaan atau kata kunci..."
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
                  <span className="font-medium">{faqItems.length}+ pertanyaan</span> tersedia dalam <span className="font-medium">{categories.length} kategori</span> layanan
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
                  Kami siap membantu dengan solusi yang tepat untuk kebutuhan digital Anda.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row">
                  <Button asChild size="default" className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold dark:text-white">
                    <Link href="/contact">
                      <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5 " />
                      Hubungi Kami
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="default" className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold border-gray-300 dark:border-gray-600 dark:text-gray-200">
                    <Link href="/#pricing">
                      Lihat Paket Layanan
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