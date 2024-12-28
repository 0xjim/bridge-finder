const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const Papa = require('papaparse')

const prisma = new PrismaClient()

async function migrateNetworks() {
  console.log('Reading networks CSV...')
  const networksData = fs.readFileSync('Networks-Grid view.csv', 'utf-8')
  const parsed = Papa.parse(networksData, { header: true, skipEmptyLines: true })
  
  console.log('Migrating networks...')
  for (const row of parsed.data) {
    try {
      const aliases = row.common_aliases 
        ? row.common_aliases.split(',').map(a => a.trim())
        : []
      
      await prisma.network.create({
        data: {
          networkName: row.network_name,
          commonAliases: aliases
        }
      })
      console.log(`Created network: ${row.network_name}`)
    } catch (error) {
      console.error(`Error migrating network ${row.network_name}:`, error)
    }
  }
}

async function migrateBridges() {
  console.log('Reading bridges CSV...')
  const bridgesData = fs.readFileSync('Bridges-Grid view.csv', 'utf-8')
  const parsed = Papa.parse(bridgesData, { header: true, skipEmptyLines: true })
  
  console.log('Migrating bridges...')
  for (const row of parsed.data) {
    try {
      const chains = row.supported_chains 
        ? row.supported_chains.split(',').map(c => c.trim())
        : []

      await prisma.bridge.create({
        data: {
          bridgeName: row.bridge_name,
          baseUrl: row.base_url,
          supportedChains: chains
        }
      })
      console.log(`Created bridge: ${row.bridge_name}`)
    } catch (error) {
      console.error(`Error migrating bridge ${row.bridge_name}:`, error)
    }
  }
}

async function main() {
  try {
    console.log('Starting migration...')
    await migrateNetworks()
    await migrateBridges()
    await prisma.network.upsert({
      where: { networkName: 'zkSync Era' },
      update: {
        commonAliases: ['zksync', 'ZKSYNC', 'zk', 'era', 'zkSync']
      },
      create: {
        networkName: 'zkSync Era',
        commonAliases: ['zksync', 'ZKSYNC', 'zk', 'era', 'zkSync']
      }
    });
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 