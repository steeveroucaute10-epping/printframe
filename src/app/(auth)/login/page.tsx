import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your PrintFrame account</p>
        </div>
        {/* TODO(phase-2): Wire to real auth (NextAuth or custom API) */}
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); console.log("Login stub - no-op") }}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?
          <Link href="/register" className="text-primary underline underline-offset-4 hover:text-primary/80">
            Sign up
          </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-primary underline underline-offset-4 hover:text-primary/80">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  )
}
