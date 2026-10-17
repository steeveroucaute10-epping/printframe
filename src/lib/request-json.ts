export class RequestBodyError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "RequestBodyError"
  }
}

export async function readTextBody(
  request: Request,
  maxBytes = 32 * 1024,
): Promise<string> {
  const declaredLength = Number(request.headers.get("content-length") || 0)
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyError("Request body is too large", 413)
  }

  if (!request.body) {
    throw new RequestBodyError("Request body is required", 400)
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel()
        throw new RequestBodyError("Request body is too large", 413)
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  return new TextDecoder().decode(body)
}

export async function readJsonBody(
  request: Request,
  maxBytes = 32 * 1024,
): Promise<unknown> {
  try {
    return JSON.parse(await readTextBody(request, maxBytes))
  } catch (error) {
    // Preserve an explicit size error rather than rewriting it as malformed JSON.
    if (error instanceof RequestBodyError) throw error
    throw new RequestBodyError("Invalid JSON", 400)
  }
}
