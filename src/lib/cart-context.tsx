"use client"

import { createContext, useContext, useReducer } from "react"

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
  frameConfig?: {
    style: string
    color: string
    matting: string
  }
}

export interface CartState {
  items: CartItem[]
  shippingMethod: 'standard' | 'express' | 'rush'
  discountCode?: string
  discountAmount: number
}

// ==================== CONSTANTS ====================

export const SHIPPING_RATES = {
  standard: { label: 'Standard (5-7 days)', price: 5.99 },
  express: { label: 'Express (2-3 days)', price: 12.99 },
  rush: { label: 'Rush (24 hours)', price: 24.99 },
}

// ==================== ACTIONS ====================

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'totalPrice'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SHIPPING'; payload: 'standard' | 'express' | 'rush' }
  | { type: 'SET_DISCOUNT'; payload: { code: string; amount: number } }

// ==================== REDUCER ====================

const initialState: CartState = {
  items: [],
  shippingMethod: 'standard',
  discountAmount: 0,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { id, productVariantId, size, color, matting, quantity, unitPrice } = action.payload
      const existingItem = state.items.find(item => item.productVariantId === productVariantId)
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productVariantId === productVariantId
              ? { ...item, quantity: item.quantity + quantity, totalPrice: (item.quantity + quantity) * item.unitPrice }
              : item
          ),
        }
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
      }

      return { ...state, items: [...state.items, newItem] }
    }

    case 'REMOVE_ITEM': {
      return { ...state, items: state.items.filter(item => item.id !== action.payload) }
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return { ...state, items: state.items.filter(item => item.id !== id) }
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id
            ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
            : item
        ),
      }
    }

    case 'CLEAR_CART': {
      return initialState
    }

    case 'SET_SHIPPING': {
      return { ...state, shippingMethod: action.payload }
    }

    case 'SET_DISCOUNT': {
      return {
        ...state,
        discountCode: action.payload.code,
        discountAmount: action.payload.amount,
      }
    }

    default:
      return state
  }
}

// ==================== CONTEXT ====================

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  total: number
  itemCount: number
} | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const total = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
  const shipping = SHIPPING_RATES[state.shippingMethod].price
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        total: total - state.discountAmount + shipping,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// ==================== HOOKS ====================

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
