import type { Menu } from "@/types/menu"

const menuData: Menu[] = [
  {
    id: 1,
    title: "explore",
    newTab: false,
    submenu: [
      { id: 12, title: "faq", path: "/faq", newTab: false },
    ],
  },
  {
    id: 3,
    title: "pricing",
    path: "/layanan/whatsapp-api#pricing",
    newTab: false,
  },
  {
    id: 4,
    title: "howToOrder",
    path: "/how-to-order",
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
