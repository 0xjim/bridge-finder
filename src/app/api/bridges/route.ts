import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const runtime = 'edge'
export const maxDuration = 120  // 2 minutes in seconds

// Get environment variables with error checking
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
  throw new Error('Missing required environment variables')
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generate a unique request ID
const generateRequestId = () => crypto.randomUUID()

const fetchFromAirtable = async (requestId: string) => {
  const filterFormula = encodeURIComponent(`IF(LOWER({requestId})=LOWER("${requestId}"),1,0)`)
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${filterFormula}&fields%5B%5D=query`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch from Airtable: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.records || data.records.length === 0) {
    return null
  }

  return data.records[0]?.fields
}

// Helper function to capitalize each word in a string
const capitalizeWords = (str: string): string => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

// Add this type at the top of the file
type Bridge = {
  name: string;
  url: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.query) {
      throw new Error('No query provided')
    }

    const requestId = generateRequestId()
    console.log('Generated requestId:', requestId)
    
    try {
      const zapierResponse = await fetch('https://hooks.zapier.com/hooks/catch/20650024/255m979/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          query: body.query
        })
      })

      if (!zapierResponse.ok) {
        console.error('Zapier request failed:', await zapierResponse.text())
        throw new Error('Failed to send request to Zapier')
      }
    } catch (e) {
      console.error('Error sending to Zapier:', e)
      throw new Error('Failed to send request to Zapier')
    }

    await delay(10000)

    for (let i = 0; i < 11; i++) {
      console.log(`Attempt ${i + 1} to fetch from Airtable`)
      try {
        const record = await fetchFromAirtable(requestId)
        if (record?.query) {
          const data = JSON.parse(record.query)
          console.log('Parsed data:', data)
          
          if (data.sourcechain && data.destinationchain && Array.isArray(data.bridges)) {
            return NextResponse.json({
              sourceChain: capitalizeWords(data.sourcechain),
              destinationChain: capitalizeWords(data.destinationchain),
              bridges: data.bridges.map((bridge: Bridge) => ({
                name: capitalizeWords(bridge.name),
                url: bridge.url
              }))
            })
          }
        }
      } catch (e) {
        console.error(`Attempt ${i + 1} failed:`, e)
      }
      await delay(10000)
    }

    return NextResponse.json({
      sourceChain: '',
      destinationChain: '',
      bridges: [],
      error: 'Still processing. Please try again in a few seconds.'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        sourceChain: '',
        destinationChain: '',
        bridges: [],
        error: error instanceof Error ? error.message : 'Please try again in a moment.'
      },
      { status: 500 }
    )
  }
} 