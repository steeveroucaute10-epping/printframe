import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getNextAuthSecret } from "@/lib/env"

export type AuthenticatedUser = {
  id: string
  role: string
}

export async function getRequestUser(request: Request): Promise<AuthenticatedUser | null> {
  const token = await getToken({
    req: request as NextRequest,
    secret: getNextAuthSecret(),
  })

  if (!token?.sub) return null

  // Resolve the role from the database so role revocation takes effect
  // immediately instead of waiting for an existing JWT to expire.
  return prisma.user.findUnique({
    where: { id: token.sub },
    select: { id: true, role: true },
  })
}

export function isAdmin(user: AuthenticatedUser | null): boolean {
  return user?.role === "ADMIN"
}
