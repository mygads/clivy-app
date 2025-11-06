"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Simplified CartItem - WhatsApp packages only
export interface CartItem {
  id: string
  name: string
  price: number // Current price in active currency
  price_idr: number
  price_usd: number
  duration: 'month' | 'year'
  maxSession: number
  qty: number // Always 1 for WhatsApp packages
  image?: string
  // Optional fields for multi-language support
  name_en?: string
  name_id?: string
}

// Simplified CartContext - Single WhatsApp package only
interface CartContextType {
  items: CartItem[]
  addToCart: (product: CartItem) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  buyNow: (product: CartItem) => void
  totalItems: number
  totalPrice: number
  // Backward compatibility (will be removed after full migration)
  selectedItems: CartItem[] // Same as items (all items are "selected" now)
  selectedItemsTotal: number // Same as totalPrice
  selectedItemsCount: number // Same as totalItems
  updateQuantity?: (productId: string, quantity: number) => void // No-op for WhatsApp
  toggleItemSelection?: (productId: string, selected: boolean) => void // No-op
  selectAllItems?: (selected: boolean) => void // No-op
  removeSelectedItems?: () => void // Same as clearCart
  clearSelectedItemsFromCart?: () => void // Same as clearCart
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  buyNow: () => {},
  totalItems: 0,
  totalPrice: 0,
  // Backward compatibility defaults
  selectedItems: [],
  selectedItemsTotal: 0,
  selectedItemsCount: 0,
  updateQuantity: () => {},
  toggleItemSelection: () => {},
  selectAllItems: () => {},
  removeSelectedItems: () => {},
  clearSelectedItemsFromCart: () => {},
})

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e)
      }
    }
  }, [])
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isClient])
  
  const addToCart = (product: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      
      // For WhatsApp packages, only allow one package in cart
      // If adding same package, keep it (don't increase qty)
      // If adding different package, replace existing one
      if (existingItem) {
        return prevItems // Don't change if same package already in cart
      } else {
        // Replace any existing package with new one (single package cart)
        return [{ ...product, qty: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setItems([])
  }

  // Buy Now functionality - clear cart and add single item, then redirect to checkout
  const buyNow = (product: CartItem) => {
    // Clear cart and add only this item
    setItems([{ ...product, qty: 1 }])
    
    // Redirect to checkout page
    if (typeof window !== 'undefined') {
      window.location.href = '/checkout'
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        buyNow,
        totalItems,
        totalPrice,
        // Backward compatibility - treat all items as "selected"
        selectedItems: items,
        selectedItemsTotal: totalPrice,
        selectedItemsCount: totalItems,
        updateQuantity: () => {}, // No-op: WhatsApp packages are always qty=1
        toggleItemSelection: () => {}, // No-op: selection not needed anymore
        selectAllItems: () => {}, // No-op
        removeSelectedItems: clearCart, // Same as clearing entire cart
        clearSelectedItemsFromCart: clearCart, // Same as clearing entire cart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
