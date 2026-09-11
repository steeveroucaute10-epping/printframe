import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/sonner-toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster />
    </CartProvider>
  )
}
