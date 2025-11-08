import type { Menu } from "@/types/menu"

const menuData: Menu[] = [
  {
    id: 1,
    title: "explore",
    newTab: false,
    submenu: [
      { id: 11, title: "about", path: "/about", newTab: false },
      { id: 12, title: "faq", path: "/faq", newTab: false },
      { id: 14, title: "documentation", path: "/whatsapp/documentation", newTab: false },
    ],
  },
  {
    id: 2,
    title: "whatIsWhatsappApi",
    path: "/#what-is-whatsapp-api",
    newTab: false,
  },
  {
    id: 3,
    title: "pricing",
    path: "/#pricing",
    newTab: false,
  },
  {
    id: 4,
    title: "whyClivy",
    path: "/#why-clivy",
    newTab: false,
  },
  {
    id: 5,
    title: "contact",
    path: "/contact",
    newTab: false,
  },
]
export default menuData
