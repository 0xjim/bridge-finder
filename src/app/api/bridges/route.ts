import { NextResponse } from 'next/server'
import crypto from 'crypto'

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
  // Use IF and LOWER for exact matching
  const filterFormula = encodeURIComponent(`IF(LOWER({requestId})=LOWER("${requestId}"),1,0)`)
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${filterFormula}&fields%5B%5D=query`
  
  process.stdout.write('\n=== AIRTABLE REQUEST DETAILS ===\n')
  process.stdout.write(`🔍 RequestId: ${requestId}\n`)
  process.stdout.write(`🔍 Filter Formula (raw): IF(LOWER({requestId})=LOWER("${requestId}"),1,0)\n`)
  process.stdout.write(`🔍 Filter Formula (encoded): ${filterFormula}\n`)
  process.stdout.write(`🔍 Full URL: ${url}\n`)
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    }
  })

  process.stdout.write(`📡 Response Status: ${response.status}\n`)
  process.stdout.write(`📡 Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\n`)

  if (!response.ok) {
    const errorText = await response.text()
    process.stdout.write(`❌ Airtable error response: ${errorText}\n`)
    throw new Error(`Failed to fetch from Airtable: ${response.status}`)
  }

  const data = await response.json()
  process.stdout.write(`📦 Airtable response data: ${JSON.stringify(data, null, 2)}\n`)
  
  if (!data.records || data.records.length === 0) {
    process.stdout.write('⚠️ No records found in Airtable\n')
    process.stdout.write('⚠️ This might mean:\n')
    process.stdout.write('   - The requestId does not exist\n')
    process.stdout.write('   - The filter formula is incorrect\n')
    process.stdout.write('   - The record has not been created yet\n')
    return null
  }

  process.stdout.write(`✅ Found record with fields: ${JSON.stringify(data.records[0].fields, null, 2)}\n`)
  process.stdout.write('=== END AIRTABLE REQUEST ===\n\n')

  return data.records[0]?.fields
}

// Helper function to capitalize each word in a string
const capitalizeWords = (str: string): string => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

export async function POST(request: Request) {
  try {
    process.stdout.write('\n\n=== API ROUTE STARTED ===\n')
    const body = await request.json()
    
    if (!body.query) {
      throw new Error('No query provided')
    }

    // Generate unique ID for this request
    const requestId = generateRequestId()
    process.stdout.write(`📝 Generated requestId: ${requestId}\n`)
    
    // Send to Zapier with request ID
    process.stdout.write('🚀 Sending to Zapier...\n')
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

    // Wait for initial delay
    await delay(3000)

    // Query Airtable with retries
    for (let i = 0; i < 6; i++) {
      try {
        const record = await fetchFromAirtable(requestId)
        if (record?.query) {
          try {
            const data = JSON.parse(record.query)
            process.stdout.write(`📦 Parsed data: ${JSON.stringify(data, null, 2)}\n`)

            if (data.sourcechain && data.destinationchain && Array.isArray(data.bridges)) {
              return NextResponse.json({
                sourceChain: capitalizeWords(data.sourcechain),
                destinationChain: capitalizeWords(data.destinationchain),
                bridges: data.bridges.map((bridge: { name: string; url: string }) => ({
                  name: capitalizeWords(bridge.name),
                  url: bridge.url
                }))
              })
            } else {
              throw new Error('Invalid data structure from Airtable')
            }
          } catch (e) {
            process.stdout.write(`❌ Error parsing JSON from Airtable: ${e}\n`)
            process.stdout.write(`❌ Raw query data: ${record.query}\n`)
          }
        }
      } catch (e) {
        process.stdout.write(`❌ Airtable fetch attempt ${i + 1} failed: ${e}\n`)
      }
      await delay(10000)
    }

    throw new Error('Failed to get valid response after retries')

  } catch (error) {
    process.stdout.write(`❌ API Error: ${error}\n`)
    return NextResponse.json(
      { 
        sourceChain: '',
        destinationChain: '',
        bridges: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
} 