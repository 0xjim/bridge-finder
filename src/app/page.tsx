'use client';

import { useState } from 'react';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

type Bridge = {
  name: string;
  url: string;
};

type BridgeResult = {
  sourceChain: string;
  destinationChain: string;
  bridges: Bridge[];
  error?: string;
};

// Dynamic imports for icons
const ArrowRight = dynamic(() =>
  import('lucide-react').then((mod) => mod.ArrowRight)
);
const Loader2 = dynamic(() =>
  import('lucide-react').then((mod) => mod.Loader2)
);
const AlertCircle = dynamic(() =>
  import('lucide-react').then((mod) => mod.AlertCircle)
);
const Sparkles = dynamic(() =>
  import('lucide-react').then((mod) => mod.Sparkles)
);
const Zap = dynamic(() => import('lucide-react').then((mod) => mod.Zap));

export default function BridgeFinder() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<BridgeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBanner] = useState(true); // Only keep showBanner

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/bridges/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
      setResult({
        sourceChain: '',
        destinationChain: '',
        bridges: [],
        error: 'Failed to process request',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showBanner && (
        <div
          className="fixed top-0 left-0 right-0 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 
          text-center py-2 z-50 shadow-xl"
        >
          <div className="relative max-w-4xl mx-auto px-4">
            <h2 className="text-sm font-black text-white/90">
              BRIDGES AND NETWORKS UP TO DATE AS OF MARCH 2026!
            </h2>
          </div>
        </div>
      )}
      <div
        className={`min-h-screen bg-gradient-to-r from-lime-300 via-yellow-300 to-pink-300 ${inter.className} 
        flex items-center justify-center p-6 pt-24`}
      >
        <div className="max-w-3xl w-full mx-auto relative">
          <header className="text-center mb-12 relative">
            <div className="flex justify-center mb-6">
              <Image
                src="/crying-wojak.jpg"
                alt="Crying Wojak"
                width={120}
                height={120}
                priority
              />
            </div>
            <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 transform hover:scale-105 transition-transform cursor-pointer pb-2">
              TOO MANY BRIDGES!!
            </h1>
            <p className="text-sm font-bold text-purple-700 animate-bounce">
              👇👇 TYPE YOUR SOURCE AND DESTINATION CHAIN BELOW TO FIND A BRIDGE
              👇👇
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6 mb-12">
            <div className="relative group transform hover:scale-101 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="'BASE TO ARBITRUM' OR 'BRIDGE FROM ETH TO OPTIMISM'"
                className="w-full p-4 rounded-full border-4 border-purple-400 shadow-xl 
                  focus:ring-4 focus:ring-yellow-300 focus:border-purple-500 
                  transition-all text-base font-bold bg-white/90 backdrop-blur-sm"
                disabled={loading}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {loading ? (
                  <Loader2 className="animate-spin h-6 w-6 text-purple-500" />
                ) : (
                  <div className="bg-white rounded-full p-1">
                    <Sparkles
                      className="text-purple-500 animate-pulse"
                      size={24}
                    />
                  </div>
                )}
              </div>
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

          {loading && (
            <div
              className="p-6 bg-white/90 text-purple-900 rounded-2xl border-4 border-purple-400 
              shadow-xl flex items-center gap-4 animate-fade-in backdrop-blur-sm mt-6"
            >
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin flex-shrink-0" />
              <div>
                <p className="text-xl font-black">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
                    SEARCHING FOR BRIDGES BETWEEN YOUR CHAINS...
                  </span>{' '}
                  ✨
                </p>
              </div>
            </div>
          )}

          {!loading && result?.error && (
            <div
              className="p-6 bg-white/90 text-red-900 rounded-2xl border-4 border-red-400 
              shadow-xl flex items-center gap-4 animate-fade-in backdrop-blur-sm"
            >
              <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
              <p className="text-xl font-black">
                <span className="bg-gradient-to-r from-red-600 to-pink-500 text-transparent bg-clip-text">
                  {result.error.includes('Networks not found') ||
                  result.error.includes('Network not found')
                    ? "WE DON'T RECOGNIZE THOSE CHAINS!! DOUBLE CHECK YOUR SPELLING OR TRY ANOTHER NETWORK"
                    : result.error.includes('No bridges found')
                      ? 'NO BRIDGES SUPPORT THAT ROUTE YET!! TRY A DIFFERENT CHAIN PAIR!!'
                      : 'SOMETHING WENT WRONG!! TRY AGAIN IN A FEW!!'}
                </span>{' '}
                {result.error.includes('Networks not found') ||
                result.error.includes('Network not found')
                  ? '🥹'
                  : '✨'}
              </p>
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
                      <Zap
                        className="text-yellow-400 animate-pulse"
                        size={24}
                      />
                    </div>

                    <a
                      href={bridge.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 
                        text-white py-3 rounded-full font-black text-base hover:opacity-90 
                        transition-opacity transform hover:scale-105 shadow-lg text-center"
                    >
                      GO TO BRIDGE!!! ✨
                    </a>
                  </div>
                ))}
              </div>
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
    </>
  );
}
