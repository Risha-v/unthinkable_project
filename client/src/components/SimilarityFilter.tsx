interface SimilarityFilterProps {
  minSimilarity: number
  onSimilarityChange: (value: number) => void
  totalResults: number
  filteredResults: number
}

const SimilarityFilter = ({
  minSimilarity,
  onSimilarityChange,
  totalResults,
  filteredResults,
}: SimilarityFilterProps) => {
  const getFilterLabel = (value: number) => {
    if (value === 0) return 'All Results'
    if (value >= 0.8) return 'Excellent Only'
    if (value >= 0.6) return 'Good or Better'
    if (value >= 0.4) return 'Fair or Better'
    return `${(value * 100).toFixed(0)}%+ Match`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Filter by Similarity</h3>
          <p className="text-sm text-gray-600">
            Showing {filteredResults} of {totalResults} results
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {(minSimilarity * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">Minimum Match</div>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="100"
          value={minSimilarity * 100}
          onChange={(e) => onSimilarityChange(Number(e.target.value) / 100)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${minSimilarity * 100}%, #e5e7eb ${minSimilarity * 100}%, #e5e7eb 100%)`,
          }}
        />

        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-600">
          <span>0%</span>
          <span className="font-medium text-blue-600">{getFilterLabel(minSimilarity)}</span>
          <span>100%</span>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onSimilarityChange(0)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            minSimilarity === 0
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onSimilarityChange(0.4)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            minSimilarity === 0.4
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
          }`}
        >
          Fair+
        </button>
        <button
          onClick={() => onSimilarityChange(0.6)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            minSimilarity === 0.6
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          Good+
        </button>
        <button
          onClick={() => onSimilarityChange(0.8)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            minSimilarity === 0.8
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          Excellent
        </button>
      </div>

      {/* Info */}
      {filteredResults < totalResults && (
        <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="font-medium">{totalResults - filteredResults}</span> products hidden by filter
        </div>
      )}
    </div>
  )
}

export default SimilarityFilter