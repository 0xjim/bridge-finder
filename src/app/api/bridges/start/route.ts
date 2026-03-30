import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildBridgeUrl } from '@/lib/bridge-deeplinks';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
  const prompt = `Extract source and destination chain names from the following query. Return ONLY a JSON object with 'source' and 'destination' fields, no other text. Query: "${query}"`;

  console.log('Claude prompt:', prompt);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    });

    const content =
      response.content[0].type === 'text' ? response.content[0].text : null;
    console.log('Claude response:', content);

    if (!content) {
      throw new Error('No content returned from Claude');
    }

    // Strip markdown code fences if present
    const cleaned = content
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Error calling Claude:', error);
    throw new Error('Failed to extract chains from Claude');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Start API called with query:', body.query);

    if (!body.query) {
      throw new Error('No query provided');
    }

    // Extract chains using Claude
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

    // Return results with deep-linked URLs
    return NextResponse.json({
      sourceChain: sourceNetwork.networkName,
      destinationChain: destinationNetwork.networkName,
      bridges: bridges.map((b) => ({
        name: b.bridgeName,
        url: buildBridgeUrl(
          b.bridgeName,
          b.baseUrl,
          sourceNetwork.networkName,
          destinationNetwork.networkName
        ),
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
