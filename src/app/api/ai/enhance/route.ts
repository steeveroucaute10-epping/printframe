// src/app/api/ai/enhance/route.ts
import { NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'
import { z } from 'zod'
import { readJsonBody, RequestBodyError } from '@/lib/request-json'
import { checkRateLimit } from '@/lib/rate-limit'

const enhancementSchema = z.object({
  imageUrl: z.string().url().max(2048),
  enhancements: z.object({
    autoEnhance: z.boolean().optional(),
    sharpen: z.boolean().optional(),
    noiseReduction: z.boolean().optional(),
    colorCorrect: z.boolean().optional(),
    upscale: z.boolean().optional(),
  }).strict().optional(),
}).strict()

const allowedOllamaHosts = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  'host.docker.internal',
])

function getOllamaEndpoint(): URL | null {
  try {
    const baseUrl = new URL(
      process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    )
    if (
      !['http:', 'https:'].includes(baseUrl.protocol) ||
      !allowedOllamaHosts.has(baseUrl.hostname)
    ) {
      return null
    }
    return new URL('/api/generate', baseUrl)
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const rateLimit = checkRateLimit(`ai:${user.id}`, 30, 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many AI requests' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        },
      )
    }

    const parsed = enhancementSchema.safeParse(await readJsonBody(request))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid enhancement request' }, { status: 400 })
    }
    const { imageUrl, enhancements } = parsed.data

    // Default enhancements
    const defaultEnhancements = {
      autoEnhance: true,
      sharpen: false,
      noiseReduction: false,
      colorCorrect: true,
      upscale: false,
    }

    const config = { ...defaultEnhancements, ...enhancements }

    const ollamaEndpoint = getOllamaEndpoint()
    if (ollamaEndpoint) {
      try {
        // Try to run local AI enhancement
        const response = await fetch(ollamaEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10_000),
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3.2-vision',
            prompt: `Enhance this image: ${imageUrl}. Apply: ${JSON.stringify(config)}`,
            stream: false,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          return NextResponse.json({
            enhancedImageUrl: imageUrl, // Local processing placeholder
            config,
            processingTime: result.eval_count || 0,
          })
        }
      } catch {
        console.log('Local AI not available, using mock processing')
      }
    }

    // Mock response for now (would integrate with actual AI service)
    return NextResponse.json({
      enhancedImageUrl: imageUrl,
      config,
      processingTime: 0,
      mockProcessing: true,
      message: 'AI enhancement ready - connect Ollama for local processing',
    })
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('AI enhancement error:', error)
    return NextResponse.json(
      { error: 'Enhancement failed' },
      { status: 500 }
    )
  }
}
