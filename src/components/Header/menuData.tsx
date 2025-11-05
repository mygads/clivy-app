import type { Menu } from "@/types/menu"

const menuData: Menu[] = [
  {
    id: 1,
    title: "explore",
    newTab: false,
    submenu: [
      { id: 11, title: "aboutGenfity", path: "/about", newTab: false },
      { id: 12, title: "faq", path: "/faq", newTab: false },
      { id: 13, title: "blog", path: "#", newTab: false },
      { id: 14, title: "career", path: "#", newTab: false },
    ],
  },
  {
    id: 2,
    title: "services",
    newTab: false,    megaMenu: [
      {
        title: "mainServices",
        items: [
          {
            id: 21,
            title: "customWebsite",
            path: "/layanan/custom-website",
            newTab: false,
            icon: "FiMonitor",
            desc: "customWebsiteDesc",
          },
          {
            id: 22,
            title: "webApp",
            path: "/layanan/web-app",
            newTab: false,
            icon: "FiGlobe",
            desc: "webAppDesc",
          },
          {
            id: 23,
            title: "mobileDevelopment",
            path: "/layanan/mobile-development",
            newTab: false,
            icon: "FiSmartphone",
            desc: "mobileDevelopmentDesc",
          },
          {
            id: 24,
            title: "corporateSystem",
            path: "/layanan/corporate-system",
            newTab: false,
            icon: "FiDatabase",
            desc: "corporateSystemDesc",
          },
          {
            id: 25,
            title: "uiUxDesign",
            path: "/layanan/ui-ux-design",
            newTab: false,
            icon: "FiPenTool",
            desc: "uiUxDesignDesc",
          },
        ],
      },
      {
        title: "whatsappSolutions",
        items: [
          {
            id: 26,
            title: "whatsappAPI",
            path: "/layanan/whatsapp-api",
            newTab: false,
            icon: "FiMessageSquare",
            desc: "whatsappAPIDesc",
          },
          {
            id: 27,
            title: "whatsappBroadcast",
            path: "/layanan/whatsapp-broadcast",
            newTab: false,
            icon: "FiSend",
            desc: "whatsappBroadcastDesc",
          },
          {
            id: 28,
            title: "whatsappChatbot",
            path: "/layanan/whatsapp-chatbot-ai",
            newTab: false,
            icon: "FiMessageCircle",
            desc: "whatsappChatbotDesc",
          },
          {
            id: 29,
            title: "whatsappTeamInbox",
            path: "/layanan/whatsapp-team-inbox",
            newTab: false,
            icon: "FiInbox",
            desc: "whatsappTeamInboxDesc",
          },
        ],
      },
      {
        title: "others",
        items: [
          {
            id: 30,
            title: "seoSpecialist",
            path: "/layanan/seo-specialist",
            newTab: false,
            icon: "FiTrendingUp",
            desc: "seoSpecialistDesc",
          },
          {
            id: 31,
            title: "corporateBranding",
            path: "/layanan/corporate-branding",
            newTab: false,
            icon: "FiBriefcase",
            desc: "corporateBrandingDesc",
          },
          {
            id: 33,
            title: "itConsulting",
            path: "/layanan/it-consulting",
            newTab: false,
            icon: "FiUsers",
            desc: "itConsultingDesc",
          },
          {
            id: 32,
            title: "techSupport",
            path: "/layanan/tech-support",
            newTab: false,
            icon: "FiHeadphones",
            desc: "techSupportDesc",
          },
          
        ],
      },
    ],
  },
  {
    id: 3,
    title: "pricing",
    path: "/products",
    newTab: false,
  },
  {
    id: 4,
    title: "portfolio",
    path: "/portofolio",
    newTab: false,
  },
  {
    id: 5,
    title: "howToOrder",
    path: "/how-to-order",
    newTab: false,
  },
  {
    id: 6,
    title: "contact",
    path: "/contact",
    newTab: false,
  },
]
export default menuData
