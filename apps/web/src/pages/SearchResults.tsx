import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/Skeleton'
import { searchProducts } from '../api/products.api'
import type { Product } from '../api/products.api'

const SearchResults: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const doSearch = async () => {
      if (!query.trim()) {
        setProducts([])
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const data = await searchProducts(query)
        setProducts(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Search failed')
      } finally {
        setLoading(false)
      }
    }
    doSearch()
  }, [query])

  const getFirstVariant = (product: Product) => {
    return product.variants?.find((v) => v.isActive) || product.variants?.[0]
  }

  const getProductImage = (product: Product) => {
    if (product.frontImageUrl) return product.frontImageUrl
    const variant = getFirstVariant(product)
    return variant?.image?.url || ''
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <a className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</a>
          <span className="material-icons-outlined text-xs">chevron_right</span>
          <span className="text-text-main-light">Search</span>
        </div>

        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            {query ? (
              <>Results for "<span className="text-primary">{query}</span>"</>
            ) : (
              'Search'
            )}
          </h1>
          {!loading && products.length > 0 && (
            <p className="text-text-muted mt-2">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
          )}
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <div className="text-center py-20 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 border border-red-800/50">
              <span className="material-icons-outlined text-3xl text-red-400">error</span>
            </div>
            <p className="text-text-muted">{error}</p>
          </div>
        ) : !query.trim() ? (
          <div className="text-center py-20 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20">
              <span className="material-icons-outlined text-4xl text-primary">search</span>
            </div>
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Search for products</h3>
              <p className="text-text-muted">Type a keyword to find what you're looking for</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20">
              <span className="material-icons-outlined text-4xl text-primary">search_off</span>
            </div>
            <div>
              <h3 className="font-display text-xl font-bold mb-2">No results found</h3>
              <p className="text-text-muted">Try a different search term or browse our collections</p>
            </div>
            <button
              className="bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all cursor-pointer"
              onClick={() => navigate('/shop')}
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const variant = getFirstVariant(product)
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  imageUrl={getProductImage(product)}
                  price={variant?.price}
                  comparePrice={variant?.compareAtPrice ?? undefined}
                  category={product.categories?.[0]?.name}
                  variantId={variant?.id}
                  variantLabel={variant?.optionValues?.map((ov) => ov.valueName).join(' / ')}
                />
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SearchResults
