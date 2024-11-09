'use client'

import { useState } from 'react'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

type Bridge = {
  name: string
  url: string
}

type BridgeResult = {
  sourceChain: string
  destinationChain: string
  bridges: Bridge[]
  error?: string
}

// Dynamic imports for icons
const ArrowRight = dynamic(() => import('lucide-react').then(mod => mod.ArrowRight))
const Loader2 = dynamic(() => import('lucide-react').then(mod => mod.Loader2))
const AlertCircle = dynamic(() => import('lucide-react').then(mod => mod.AlertCircle))


export default function BridgeFinder() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<BridgeResult | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchBridges = async (query: string): Promise<BridgeResult> => {
    try {
      const response = await fetch('/api/bridges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Zapier response not ok:', errorText);
        throw new Error('Failed to fetch bridges');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      return {
        sourceChain: data.sourceChain || data.source_chain || '',
        destinationChain: data.destinationChain || data.destination_chain || '',
        bridges: Array.isArray(data.bridges) ? data.bridges.map((bridge: { name: string; url?: string; link?: string }) => ({
          name: bridge.name || 'Unknown Bridge',
          url: bridge.url || bridge.link || '#'
        })) : [],
        error: data.error
      }
    } catch (_error) {
      console.error('Error fetching bridges:', _error);
      return {
        sourceChain: '',
        destinationChain: '',
        bridges: [],
        error: 'Failed to fetch bridges. Please try again.'
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await fetchBridges(query)
      setResult(result)
    } catch (error) {
      setResult({
        sourceChain: '',
        destinationChain: '',
        bridges: [],
        error: 'Failed to fetch bridges. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${inter.className} flex items-center justify-center`}>
      <div className="max-w-3xl w-full mx-auto px-6 py-12">
        <header className="text-center space-y-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent inline-block pb-2">
              Too Many Bridges
            </h1>
            <p className="text-xl text-gray-600 mt-6">
              Find the best bridges for your cross-chain transfers
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 transform transition-all duration-300 mb-12">
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., 'I want to bridge from Optimism to Arbitrum'"
              className="w-full px-6 py-5 text-lg rounded-2xl border border-gray-300 shadow-sm 
                focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 
                transition-all duration-300 ease-in-out
                group-hover:shadow-md"
              disabled={loading}
            />
            {loading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Loader2 className="animate-spin h-6 w-6 text-purple-500" />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 text-center">Write in plain English which chains you want to connect</p>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-5 text-lg font-semibold text-white rounded-2xl
              bg-gradient-to-r from-purple-600 to-blue-600 
              hover:from-purple-700 hover:to-blue-700 
              focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 
              transition-all duration-300 ease-out
              transform hover:scale-[1.02]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto h-6 w-6" />
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>Find Bridges</span>
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        {result?.error && (
          <div className="p-4 bg-red-50 text-red-900 rounded-xl border border-red-100 shadow-sm
            flex items-center gap-3 animate-fade-in mt-12">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm">{result.error}</p>
          </div>
        )}

        {result && result.bridges.length > 0 && (
          <div className="space-y-8 animate-fade-in mt-12">
            <div className="flex justify-center items-center space-x-6">
              <span className="px-6 py-3 rounded-full bg-blue-100 text-blue-800 font-semibold shadow-sm">
                {result.sourceChain}
              </span>
              <ArrowRight className="text-gray-400 w-6 h-6" />
              <span className="px-6 py-3 rounded-full bg-green-100 text-green-800 font-semibold shadow-sm">
                {result.destinationChain}
              </span>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {result.bridges.map((bridge, index) => (
                <div 
                  key={index}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl 
                    transition-all duration-300 ease-out transform hover:scale-[1.02]"
                >
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {bridge.name}
                    </h3>
                    <div className="border-t border-gray-100" />
                    <a
                      href={bridge.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-3 text-center font-semibold text-white 
                        bg-gradient-to-r from-purple-600 to-blue-600 
                        rounded-lg hover:from-purple-700 hover:to-blue-700 
                        transition-all duration-300 ease-out
                        transform hover:scale-[1.02]
                        shadow-md hover:shadow-lg"
                    >
                      Go to Bridge
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && result.bridges.length === 0 && !result.error && (
          <div className="p-4 bg-yellow-50 text-yellow-900 rounded-xl border border-yellow-100 
            shadow-sm flex items-center gap-3 animate-fade-in mt-12">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <p className="text-sm">
              No bridges found for this route. Please try different chains or check your input.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}