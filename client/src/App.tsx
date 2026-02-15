import { useState, useEffect } from 'react'
import UploadBox from './components/UploadBox'
import ProductGrid from './components/ProductGrid'
import SimilarityFilter from './components/SimilarityFilter'
import { searchProducts, healthCheck } from './services/api'
import { Product } from './types'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [minSimilarity, setMinSimilarity] = useState(0)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      const isHealthy = await healthCheck()
      setBackendStatus(isHealthy ? 'online' : 'offline')
    }
    checkBackend()
  }, [])

  // Filter products by similarity
  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(p => p.similarity >= minSimilarity)
      setFilteredProducts(filtered)
    }
  }, [products, minSimilarity])

  const handleSearch = async (imageData: string, isUrl: boolean) => {
    setLoading(true)
    setError(null)
    setProducts([])
    setFilteredProducts([])

    try {
      const results = await searchProducts(imageData, isUrl)
      setProducts(results)
      setFilteredProducts(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🔍 Visual Product Matcher
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                AI-powered product similarity search
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                backendStatus === 'online' 
                  ? 'bg-green-100 text-green-800'
                  : backendStatus === 'offline'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {backendStatus === 'online' && '● Online'}
                {backendStatus === 'offline' && '● Offline'}
                {backendStatus === 'checking' && '● Checking...'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Backend Status Warning */}
        {backendStatus === 'offline' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Backend Offline</h3>
                <p className="mt-1 text-sm text-red-700">
                  Cannot connect to the backend API. Please ensure your Hugging Face Space is running.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <UploadBox onSearch={handleSearch} loading={loading} />
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {products.length > 0 && (
          <>
            <div className="mb-6">
              <SimilarityFilter
                minSimilarity={minSimilarity}
                onSimilarityChange={setMinSimilarity}
                totalResults={products.length}
                filteredResults={filteredProducts.length}
              />
            </div>

            <ProductGrid products={filteredProducts} />
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Searching for similar products...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No searches yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload a product image or paste an image URL to find similar products
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p>Powered by CLIP Neural Network</p>
            <p className="mt-1">
              Backend: <a href={import.meta.env.VITE_API_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">Hugging Face Spaces</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App