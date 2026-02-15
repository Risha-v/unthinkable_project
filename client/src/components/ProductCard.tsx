import { Product } from '../types'

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'bg-green-100 text-green-800'
    if (similarity >= 0.6) return 'bg-blue-100 text-blue-800'
    if (similarity >= 0.4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.8) return 'Excellent Match'
    if (similarity >= 0.6) return 'Good Match'
    if (similarity >= 0.4) return 'Fair Match'
    return 'Weak Match'
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fade-in">
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%236b7280"%3EImage not available%3C/text%3E%3C/svg%3E'
          }}
        />
        
        {/* Similarity Badge */}
        <div className="absolute top-2 right-2">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getSimilarityColor(product.similarity)}`}>
            {(product.similarity * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
          </div>
        )}

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price and Match Quality */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded ${getSimilarityColor(product.similarity)}`}>
            {getSimilarityLabel(product.similarity)}
          </div>
        </div>

        {/* Similarity Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Match Quality</span>
            <span>{(product.similarity * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                product.similarity >= 0.8
                  ? 'bg-green-500'
                  : product.similarity >= 0.6
                  ? 'bg-blue-500'
                  : product.similarity >= 0.4
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'
              }`}
              style={{ width: `${product.similarity * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard