import {" Link "} from "next/link"
import {" Button "} from "@/components/ui/button"
import {" Input "} from "@/components/ui/input"
import {" Label "} from "@/components/ui/label"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Reset password</h1>
          <p className="text-muted-foreground mt-2">Enter your new password below</p>
        </div>
        <form className="space-y-6" action="/api/auth/reset-password" method="POST">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" name="password" type="password" minLength=8 required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
          </div>
          <Button type="submit" className="w-full">Reset password</Button>
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
