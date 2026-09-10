// src/app/api/ai/enhance/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageUrl, enhancements } = body

    // Default enhancements
    const defaultEnhancements = {
      autoEnhance: true,
      sharpen: false,
      noiseReduction: false,
      colorCorrect: true,
      upscale: false,
    }

    const config = { ...defaultEnhancements, ...enhancements }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Check for local Ollama endpoint
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'

    if (OLLAMA_URL === 'http://localhost:11434') {
      try {
        // Try to run local AI enhancement
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      } catch (error) {
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
    console.error('AI enhancement error:', error)
    return NextResponse.json(
      { error: 'Enhancement failed' },
      { status: 500 }
    )
  }
}
