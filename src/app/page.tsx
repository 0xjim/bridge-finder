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
const Sparkles = dynamic(() => import('lucide-react').then(mod => mod.Sparkles))
const Zap = dynamic(() => import('lucide-react').then(mod => mod.Zap))


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
    <div className={`min-h-screen bg-gradient-to-r from-lime-300 via-yellow-300 to-pink-300 ${inter.className} flex items-center justify-center p-6`}>
      <div className="max-w-3xl w-full mx-auto relative">
        <header className="text-center mb-12 relative">
          <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 transform hover:scale-105 transition-transform cursor-pointer pb-2">
            TOO MANY BRIDGES!!
          </h1>
          <p className="text-xl font-bold text-purple-700 animate-bounce">
            👇👇 FIND YOUR PERFECT BRIDGE NOW 👇👇
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 mb-12">
          <div className="relative group transform hover:scale-101 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="TYPE YOUR BRIDGE DREAMS HERE ('LEMME GO FROM BASE TO ARBITRUM')"
              className="w-full p-4 rounded-full border-4 border-purple-400 shadow-xl 
                focus:ring-4 focus:ring-yellow-300 focus:border-purple-500 
                transition-all text-base font-bold bg-white/90 backdrop-blur-sm"
              disabled={loading}
            />
            {loading ? (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin h-6 w-6 text-purple-500" />
            ) : (
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 animate-pulse" size={24} />
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 text-lg font-black text-white rounded-full
              bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 
              hover:opacity-90 transition-opacity transform hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              shadow-xl border-4 border-purple-400 relative overflow-hidden"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto h-6 w-6" />
            ) : (
              <span className="flex items-center justify-center space-x-3">
                <span>LET'S GOOO</span>
                <Zap className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        {result?.error && (
          <div className="p-6 bg-red-100/90 text-red-900 rounded-2xl border-4 border-red-400 
            shadow-xl flex items-center gap-4 animate-fade-in backdrop-blur-sm">
            <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            <p className="font-bold">{result.error}</p>
          </div>
        )}

        {result && result.bridges.length > 0 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-center items-center space-x-6">
              <span className="px-6 py-3 rounded-full bg-blue-400 text-white font-black text-base border-4 border-blue-500 shadow-xl transform hover:rotate-3 transition-transform">
                {result.sourceChain} ⚡️
              </span>
              <ArrowRight className="text-purple-600 w-6 h-6 animate-pulse" />
              <span className="px-6 py-3 rounded-full bg-green-400 text-white font-black text-base border-4 border-green-500 shadow-xl transform hover:-rotate-3 transition-transform">
                {result.destinationChain} 🚀
              </span>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {result.bridges.map((bridge, index) => (
                <div 
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border-4 border-purple-300 
                    transform hover:scale-105 transition-all hover:rotate-1"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
                      {bridge.name}
                    </h3>
                    <Zap className="text-yellow-400 animate-pulse" size={24} />
                  </div>
                  
                  <a
                    href={bridge.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 
                      text-white py-3 rounded-full font-black text-base hover:opacity-90 
                      transition-opacity transform hover:scale-105 shadow-lg text-center"
                  >
                    BRIDGE NOW!!! ✨
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && result.bridges.length === 0 && !result.error && (
          <div className="p-6 bg-yellow-100/90 text-yellow-900 rounded-2xl border-4 border-yellow-400 
            shadow-xl flex items-center gap-4 animate-fade-in backdrop-blur-sm">
            <AlertCircle className="h-8 w-8 text-yellow-500 flex-shrink-0" />
            <p className="font-bold">
              NO BRIDGES FOUND! TRY DIFFERENT CHAINS! ✨
            </p>
          </div>
        )}

        <footer className="text-center mt-12">
          <p className="text-purple-700 font-bold text-base">
            built by{' '}
            <a 
              href="https://x.com/0xJim" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 
                hover:scale-105 transform inline-block transition-transform"
            >
              0xjim 🫡
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}