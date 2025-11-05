"use client"

import { Shield, Clock, Users, Zap, Award, HeartHandshake } from 'lucide-react'

const reasons = [
  {
    icon: Shield,
    title: "Keahlian & Pengalaman",
    description:
      "Tim kami terdiri dari profesional berpengalaman dengan keahlian di berbagai bidang teknologi dan bisnis.",
  },
  {
    icon: Clock,
    title: "Tepat Waktu",
    description: "Kami berkomitmen untuk menyelesaikan proyek sesuai dengan jadwal yang telah disepakati.",
  },
  {
    icon: Users,
    title: "Berfokus pada Klien",
    description: "Kami mendengarkan kebutuhan Anda dan menyediakan solusi yang disesuaikan dengan bisnis Anda.",
  },
  {
    icon: Zap,
    title: "Teknologi Terkini",
    description: "Kami selalu menggunakan teknologi terbaru untuk memastikan solusi kami efektif dan relevan.",
  },
  {
    icon: Award,
    title: "Kualitas Terjamin",
    description: "Kami menjamin kualitas tertinggi dalam setiap proyek yang kami kerjakan.",
  },
  {
    icon: HeartHandshake,
    title: "Dukungan Berkelanjutan",
    description: "Kami tidak hanya membangun solusi, tetapi juga memberikan dukungan berkelanjutan setelah proyek selesai.",
  },
]

export default function WhyChooseUs() {
  return (    <section className="bg-white py-12 sm:py-16 lg:py-20 dark:bg-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            Mengapa <span className="text-primary">Memilih</span> Kami
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mt-2 sm:mt-2">
            Kami menawarkan keunggulan yang membedakan kami dari yang lain
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="group rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                <reason.icon className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>
              <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{reason.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
