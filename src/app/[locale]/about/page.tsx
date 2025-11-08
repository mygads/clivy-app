"use client"

import { motion } from "framer-motion"
import { 
  Users, 
  Target, 
  Lightbulb, 
  Award,
  GraduationCap
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

export default function AboutPage() {
  const t = useTranslations("about")

  const teamMembers = [
    {
      name: "Muhammad Yoga Adi Saputra",
      nim: "102022580032",
      role: t("team.members.yoga.role"),
      image: "/images/team/yoga.jpg",
      description: t("team.members.yoga.description"),
    },
    {
      name: "Fadli Muhammad Arsyi",
      nim: "102022580036",
      role: t("team.members.fadli.role"),
      image: "/images/team/fadli.jpg",
      description: t("team.members.fadli.description"),
    },
    {
      name: "Riyana Kartika Pratiwi",
      nim: "102022580006",
      role: t("team.members.riyana.role"),
      image: "/images/team/riyana.jpg",
      description: t("team.members.riyana.description"),
    },
    {
      name: "Delita Noor Iftitah",
      nim: "102022580045",
      role: t("team.members.delita.role"),
      image: "/images/team/delita.jpg",
      description: t("team.members.delita.description"),
    }
  ]

  const values = [
    {
      icon: Target,
      title: t("values.innovation.title"),
      description: t("values.innovation.description")
    },
    {
      icon: Users,
      title: t("values.collaboration.title"),
      description: t("values.collaboration.description")
    },
    {
      icon: Lightbulb,
      title: t("values.creativity.title"),
      description: t("values.creativity.description")
    },
    {
      icon: Award,
      title: t("values.quality.title"),
      description: t("values.quality.description")
    }
  ]
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge className="mb-4" variant="outline">{t("hero.badge")}</Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t("hero.title")}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {t("hero.description")}
            </p>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold">{t("story.title")}</h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t("story.paragraph1")}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t("story.paragraph2")}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t("story.paragraph3")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("values.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("values.subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("team.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
              {t("team.subtitle")}
            </p>
            <Badge variant="outline" className="mt-4">
              <GraduationCap className="h-4 w-4 mr-2" />
              {t("team.university")}
            </Badge>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardHeader className="text-center pb-4">
                    <div className="w-32 h-32 mx-auto mb-4 relative rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Users className="h-16 w-16 text-primary/40" />
                    </div>
                    <CardTitle className="text-xl mb-1">{member.name}</CardTitle>
                    <CardDescription className="font-mono text-xs mb-3">
                      {t("team.nim")}: {member.nim}
                    </CardDescription>
                    <Badge variant="secondary" className="mx-auto">
                      {member.role}
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
