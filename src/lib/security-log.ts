type SecurityContext = Record<
  string,
  string | number | boolean | null | undefined
>

export function logSecurityEvent(
  event: string,
  context: SecurityContext = {},
): void {
  console.warn('[security]', JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...context,
  }))
}
