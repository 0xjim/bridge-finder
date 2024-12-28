import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function findChainByNameOrAlias(chainName: string) {
  console.log('Looking up chain:', chainName);

  // Convert input to lowercase for comparison
  const searchTerm = chainName.toLowerCase();
  console.log('Search term (lowercase):', searchTerm);

  const network = await prisma.network.findFirst({
    where: {
      OR: [
        // Exact match on network name (case insensitive)
        {
          networkName: {
            equals: searchTerm,
            mode: 'insensitive',
          },
        },
        // Exact match on any alias
        {
          commonAliases: {
            hasSome: [
              searchTerm,
              searchTerm.toUpperCase(),
              searchTerm.replace(/\s+/g, ''), // Remove spaces
              searchTerm.replace(/\s+/g, '') + 'era', // Handle "zksync" -> "zksyncera"
              'zk' + searchTerm.replace(/^zk\s*/i, ''), // Handle "zksync" -> "zk sync"
            ],
          },
        },
      ],
    },
  });

  if (!network) {
    console.log(
      `No network found for ${chainName}. Available networks:`,
      await prisma.network.findMany({
        select: { networkName: true, commonAliases: true },
      })
    );
  } else {
    console.log(`Found network for ${chainName}:`, network);
  }

  return network;
}

async function extractChains(query: string) {
  const prompt = `Extract source and destination chain names from the following query. Return a JSON object with 'source' and 'destination' fields. Query: "${query}"`;

  console.log('OpenAI prompt:', prompt); // Log the prompt

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices[0].message.content;
    console.log('OpenAI response:', content); // Log the response

    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Failed to extract chains from OpenAI');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Start API called with query:', body.query);

    if (!body.query) {
      throw new Error('No query provided');
    }

    // Extract chains using OpenAI
    const { source, destination } = await extractChains(body.query);

    // Look up official chain names
    const sourceNetwork = await findChainByNameOrAlias(source);
    const destinationNetwork = await findChainByNameOrAlias(destination);

    if (!sourceNetwork || !destinationNetwork) {
      const error =
        !sourceNetwork && !destinationNetwork
          ? `Networks not found: ${source} and ${destination}`
          : !sourceNetwork
            ? `Network not found: ${source}`
            : `Network not found: ${destination}`;

      throw new Error(error);
    }

    // Find bridges that support both chains using official names
    const bridges = await prisma.bridge.findMany({
      where: {
        AND: [
          { supportedChains: { has: sourceNetwork.networkName } },
          { supportedChains: { has: destinationNetwork.networkName } },
        ],
      },
      select: {
        bridgeName: true,
        baseUrl: true,
      },
    });

    // Return results directly
    return NextResponse.json({
      sourceChain: sourceNetwork.networkName,
      destinationChain: destinationNetwork.networkName,
      bridges: bridges.map((b) => ({
        name: b.bridgeName,
        url: b.baseUrl,
      })),
    });
  } catch (error) {
    console.error('Error in start API:', error);
    return NextResponse.json({
      sourceChain: '',
      destinationChain: '',
      bridges: [],
      error: error instanceof Error ? error.message : 'Failed to start request',
    });
  }
}
