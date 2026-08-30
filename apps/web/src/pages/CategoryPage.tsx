import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/Skeleton'
import { getCategoryBySlug } from '../api/categories.api'
import { getProductsByCategory } from '../api/products.api'
import type { Category } from '../api/categories.api'
import type { Product } from '../api/products.api'

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return
      setLoading(true)
      setError('')
      try {
        const cat = await getCategoryBySlug(slug)
        setCategory(cat)

        if (cat?.id) {
          const prodData = await getProductsByCategory(cat.id)
          setProducts(Array.isArray(prodData) ? prodData : [])
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load category')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

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
          <a className="hover:text-primary cursor-pointer" onClick={() => navigate('/shop')}>Shop</a>
          <span className="material-icons-outlined text-xs">chevron_right</span>
          <span className="text-text-main-light">{category?.name || 'Category'}</span>
        </div>

        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold">{category?.name || 'Category'}</h1>
          {category?.children && category.children.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6">
              {category.children.map((child) => (
                <button
                  key={child.id}
                  className="px-5 py-2 rounded-full border border-primary/20 text-sm font-medium text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                  onClick={() => navigate(`/categories/${child.slug}`)}
                >
                  {child.name}
                </button>
              ))}
            </div>
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
        ) : products.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
              <span className="material-icons-outlined text-3xl text-primary">inventory_2</span>
            </div>
            <p className="text-text-muted">No products in this category yet</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-muted mb-6">{products.length} product{products.length !== 1 ? 's' : ''}</p>
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
                    priceWithTax={variant?.priceWithTax}
                    comparePrice={variant?.compareAtPrice ?? undefined}
                    compareAtPriceWithTax={variant?.compareAtPriceWithTax ?? undefined}
                    variantId={variant?.id}
                    variantLabel={variant?.optionValues?.map((ov) => ov.valueName).join(' / ')}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default CategoryPage
