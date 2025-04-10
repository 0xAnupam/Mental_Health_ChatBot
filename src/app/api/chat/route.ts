// src/app/api/chat/route.ts
import { HfInference } from '@huggingface/inference'
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN)

interface ChatRequest {
  message: string
  userId: string
}

interface ChatResponse {
  text?: string
  error?: string
  details?: string
}

export async function POST(request: Request) {
  try {
    const { message, userId } = (await request.json()) as ChatRequest

    if (!message?.trim() || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get conversation context
    const context = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { message: true }
    })

    // Build the prompt with context
    // const prompt = `Context: ${context.map(c => c.message).join(', ') || 'none'}\nUser: ${message}\nAssistant:`
    // src/app/api/chat/route.ts
    const prompt = `You're a mental health assistant. Use this conversation history: ${context}
    Current message: ${message}
    Respond concisely without repeating the context. Focus on practical advice:`
    // Get AI response
    const response = await hf.textGeneration({
      model: 'HuggingFaceH4/zephyr-7b-beta',
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        return_full_text: false,
        temperature: 0.7
      }
    })

    // Save conversation to database
    await prisma.conversation.create({
      data: {
        userId,
        message
      }
    })

    return NextResponse.json({
      text: response.generated_text.trim()
    } as ChatResponse)

  } catch (error) {
    console.error('Chat API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process your request',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as ChatResponse,
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}