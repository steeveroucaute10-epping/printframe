import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/sonner-toaster"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Suspense>
              {children}
            </Suspense>
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}
