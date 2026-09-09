"use client"

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react"

// ==================== TYPES ====================

export interface CartItem {
  id: string
  productVariantId: string
  size: string
  color: string
  matting: string
  quantity: number
  unitPrice: number
  totalPrice: number
  name?: string
}

export interface CartState {
  items: CartItem[]
  shippingMethod: "standard" | "express" | "rush"
  discountCode?: string
  discountPercent: number
}

// ==================== CONSTANTS ====================

export const SHIPPING_RATES: Record<string, { label: string; price: number }> = {
  standard: { label: "Standard (5-7 days)", price: 5.99 },
  express: { label: "Express (2-3 days)", price: 12.99 },
  rush: { label: "Rush (24 hours)", price: 24.99 },
}

const DISCOUNT_CODES: Record<string, number> = {
  SAVE10: 10,
  SAVE20: 20,
  WELCOME: 15,
}

// ==================== ACTIONS ====================

export type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "totalPrice"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_SHIPPING"; payload: "standard" | "express" | "rush" }
  | { type: "APPLY_DISCOUNT"; payload: string }
  | { type: "REMOVE_DISCOUNT" }

// ==================== REDUCER ====================

const initialState: CartState = {
  items: [],
  shippingMethod: "standard",
  discountPercent: 0,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { id, productVariantId, size, color, matting, quantity, unitPrice, name } = action.payload
      const existingIndex = state.items.findIndex(
        (item) => item.productVariantId === productVariantId && item.size === size && item.color === color && item.matting === matting,
      )

      if (existingIndex >= 0) {
        const updatedItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity, totalPrice: (item.quantity + quantity) * item.unitPrice }
            : item,
        )
        return { ...state, items: updatedItems }
      }

      const newItem: CartItem = {
        id,
        productVariantId,
        size,
        color,
        matting,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        name,
      }
      return { ...state, items: [...state.items, newItem] }
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.id !== id) }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity, totalPrice: quantity * item.unitPrice } : item,
        ),
      }
    }

    case "CLEAR_CART":
      return { ...initialState }

    case "SET_SHIPPING":
      return { ...state, shippingMethod: action.payload }

    case "APPLY_DISCOUNT": {
      const percent = DISCOUNT_CODES[action.payload]
      if (percent) return { ...state, discountPercent: percent, discountCode: action.payload }
      return state
    }

    case "REMOVE_DISCOUNT":
      return { ...state, discountPercent: 0, discountCode: undefined }

    default:
      return state
  }
}

// ==================== CONTEXT ====================

interface CartContextType {
  state: CartState
  dispatch: Dispatch<CartAction>
  subtotal: number
  shipping: number
  discount: number
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
  const shipping = SHIPPING_RATES[state.shippingMethod].price
  const discount = subtotal * (state.discountPercent / 100)
  const total = Math.max(0, subtotal - discount + (state.items.length > 0 ? shipping : 0))
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ state, dispatch, subtotal, shipping, discount, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
