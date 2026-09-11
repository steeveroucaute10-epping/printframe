import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Forgot password?</h1>
          <p className="text-muted-foreground mt-2">Enter your email and we'll send a reset link</p>
        </div>
        {/* TODO(phase-2): Wire to real password-reset API */}
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); console.log("Forgot password stub - no-op") }}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <Button type="submit" className="w-full">Send reset link</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/80">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
