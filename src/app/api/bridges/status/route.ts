import { NextResponse } from 'next/server'

export const runtime = 'edge'

// Environment variables
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
  throw new Error('Missing required environment variables')
}

type Bridge = {
  name: string;
  url: string;
}

const capitalizeWords = (str: string): string => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.requestId) {
      throw new Error('No requestId provided')
    }

    const record = await fetchFromAirtable(body.requestId)
    if (record?.query) {
      const data = JSON.parse(record.query)
      
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

    return NextResponse.json({ status: 'pending' })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check status' },
      { status: 500 }
    )
  }
} 