import { NextResponse } from 'next/server'

export const runtime = 'edge'

const generateRequestId = () => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.query) {
      throw new Error('No query provided')
    }

    const requestId = generateRequestId()
    
    await fetch('https://hooks.zapier.com/hooks/catch/20650024/255m979/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
        query: body.query
      })
    })

    return NextResponse.json({ requestId })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start request' },
      { status: 500 }
    )
  }
} 