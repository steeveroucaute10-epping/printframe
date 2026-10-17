import { CartProvider } from "@/lib/cart-client"
import { Toaster } from "@/components/ui/sonner-toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster />
    </CartProvider>
  )
}
