import ProductCard from './ProductCard'
import { Product } from '../types'

interface ProductGridProps {
  products: Product[]
}

const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your similarity filter or upload a different image
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Similar Products ({products.length})
        </h2>
        <div className="text-sm text-gray-600">
          Sorted by similarity
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Results Footer */}
      {products.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {products.length} {products.length === 1 ? 'result' : 'results'}
        </div>
      )}
    </div>
  )
}

export default ProductGrid