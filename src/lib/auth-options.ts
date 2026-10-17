import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { getNextAuthSecret } from "@/lib/env"
import { checkRateLimit } from "@/lib/rate-limit"
import { logSecurityEvent } from "@/lib/security-log"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        const email = credentials.email.trim().toLowerCase()
        if (email.length > 254 || credentials.password.length > 128) return null
        const rateLimit = checkRateLimit(`login:${email}`, 10, 15 * 60 * 1000)
        if (!rateLimit.allowed) {
          logSecurityEvent("login_rate_limited")
          return null
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.passwordHash) return null

        const isMatch = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = (user as { role?: string }).role ?? "CUSTOMER"
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  secret: getNextAuthSecret(),
}
