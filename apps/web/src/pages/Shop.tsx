import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/Skeleton'
import { getProducts } from '../api/products.api'
import { getCategories } from '../api/categories.api'
import { getBrands } from '../api/brands.api'
import { getFilterGroups } from '../api/filters.api'
import type { Product } from '../api/products.api'
import type { Category } from '../api/categories.api'
import type { Brand } from '../api/brands.api'
import type { FilterGroup } from '../api/filters.api'

// Collapsible sidebar block so a long filter list stays compact.
const FilterSection: React.FC<{
  title: string
  selectedCount?: number
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}> = ({ title, selectedCount = 0, open, onToggle, children }) => (
  <div className="bg-surface-dark rounded-2xl border border-primary/10">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between gap-2 px-5 py-4 cursor-pointer"
    >
      <span className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold text-primary-light">
        {title}
        {selectedCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-primary text-black text-[10px] font-extrabold leading-none">
            {selectedCount}
          </span>
        )}
      </span>
      <span className={`material-icons-outlined text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
    </button>
    {open && <div className="px-5 pb-5 max-h-64 overflow-y-auto">{children}</div>}
  </div>
)

const Shop: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>('newest')
  const [filterOpen, setFilterOpen] = useState(false)
  // Sections the shopper has toggled; unlisted ones use their default (categories/brands open, filter groups closed)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const resultsRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  const isSectionOpen = (key: string, defaultOpen: boolean) => openSections[key] ?? defaultOpen
  const toggleSection = (key: string, defaultOpen: boolean) =>
    setOpenSections((prev) => ({ ...prev, [key]: !(prev[key] ?? defaultOpen) }))

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: any = {}
      if (selectedCategory) params.categoryId = selectedCategory
      if (selectedBrand) params.brand = selectedBrand
      if (selectedFilters.length > 0) params.filterValueIds = selectedFilters
      switch (sortBy) {
        case 'price-low':
          params.sortBy = 'price'
          params.sortOrder = 'asc'
          break
        case 'price-high':
          params.sortBy = 'price'
          params.sortOrder = 'desc'
          break
        case 'popular':
          params.sortBy = 'purchasedCount'
          params.sortOrder = 'desc'
          break
        default:
          params.sortBy = 'createdAt'
          params.sortOrder = 'desc'
      }

      const [prodData, catData, brandData, filterGroupsData] = await Promise.all([
        getProducts(params),
        getCategories(),
        getBrands(),
        getFilterGroups()
      ])

      setProducts(Array.isArray(prodData) ? prodData : [])
      setCategories(Array.isArray(catData) ? catData : [])
      setBrands(Array.isArray(brandData) ? brandData : [])
      setFilterGroups(Array.isArray(filterGroupsData) ? filterGroupsData : [])
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load products'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedBrand, selectedFilters, sortBy])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getFirstVariant = (product: Product) => {
    const variants = product.variants || []
    return variants.find((v) => v.isActive) || variants[0]
  }

  const getProductImage = (product: Product) => {
    if (product.frontImageUrl) return product.frontImageUrl
    const variant = getFirstVariant(product)
    return variant?.image?.url || ''
  }

  const getVariantLabel = (product: Product) => {
    const variant = getFirstVariant(product)
    if (!variant?.optionValues) return ''
    return variant.optionValues.map((ov) => ov.valueName).join(' / ')
  }

  const getCategoryName = (product: Product) => {
    return product.categories?.[0]?.name || ''
  }

  // After changing a filter, bring the results back into view if the page was scrolled past them.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const el = resultsRef.current
    if (el && el.getBoundingClientRect().top < 80) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedCategory, selectedBrand, selectedFilters, sortBy])

  const handleFilterToggle = (valueId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(valueId) ? prev.filter((id) => id !== valueId) : [...prev, valueId]
    )
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setSelectedFilters([])
    setSortBy('newest')
  }

  const activeChips: { key: string; label: string; onRemove: () => void }[] = []
  if (selectedCategory) {
    activeChips.push({
      key: `cat-${selectedCategory}`,
      label: categories.find((c) => c.id === selectedCategory)?.name ?? 'Category',
      onRemove: () => setSelectedCategory(''),
    })
  }
  if (selectedBrand) {
    activeChips.push({
      key: `brand-${selectedBrand}`,
      label: brands.find((b) => b.id === selectedBrand)?.name ?? 'Brand',
      onRemove: () => setSelectedBrand(''),
    })
  }
  for (const valueId of selectedFilters) {
    const label = filterGroups.flatMap((g) => g.values).find((v) => v.id === valueId)?.name
    if (label) activeChips.push({ key: `fv-${valueId}`, label, onRemove: () => handleFilterToggle(valueId) })
  }

  const hasFilters = selectedCategory || selectedBrand || selectedFilters.length > 0 || sortBy !== 'newest'

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
            <a className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</a>
            <span className="material-icons-outlined text-xs">chevron_right</span>
            <span className="text-text-main-light">Shop</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold">All Products</h1>
              <p className="text-text-muted mt-2">Discover our complete collection of premium beauty products</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <span className="material-icons-outlined text-lg">tune</span>
                <span className="text-sm font-medium">Filters</span>
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-primary/20 bg-surface-dark text-text-main-light text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`${filterOpen ? 'fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:relative md:bg-transparent md:backdrop-blur-none' : 'hidden md:block'} w-full md:w-64 shrink-0`}>
            <div className={`${filterOpen ? 'absolute right-0 top-0 h-full w-[280px] bg-surface-dark overflow-y-auto p-4 animate-slideRight md:relative md:w-auto md:h-auto md:animate-none md:p-0' : ''} space-y-4 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:pr-1`}>
              {/* Mobile filter header */}
              {filterOpen && (
                <div className="flex items-center justify-between md:hidden mb-4 pb-4 border-b border-primary/10">
                  <h3 className="text-lg font-bold text-text-main-light">Filters</h3>
                  <button
                    className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                    onClick={() => setFilterOpen(false)}
                  >
                    <span className="material-icons-outlined">close</span>
                  </button>
                </div>
              )}
            <FilterSection
              title="Categories"
              selectedCount={selectedCategory ? 1 : 0}
              open={isSectionOpen('categories', true)}
              onToggle={() => toggleSection('categories', true)}
            >
              <ul className="space-y-2">
                <li>
                  <button
                    className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${!selectedCategory ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary'}`}
                    onClick={() => setSelectedCategory('')}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${selectedCategory === cat.id ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary'}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </FilterSection>

            <FilterSection
              title="Brands"
              selectedCount={selectedBrand ? 1 : 0}
              open={isSectionOpen('brands', true)}
              onToggle={() => toggleSection('brands', true)}
            >
              <ul className="space-y-2">
                <li>
                  <button
                    className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${!selectedBrand ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary'}`}
                    onClick={() => setSelectedBrand('')}
                  >
                    All Brands
                  </button>
                </li>
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <button
                      className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${selectedBrand === brand.id ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary'}`}
                      onClick={() => setSelectedBrand(brand.id)}
                    >
                      {brand.name}
                    </button>
                  </li>
                ))}
              </ul>
            </FilterSection>

            {filterGroups.map((group) => (
              <FilterSection
                key={group.id}
                title={group.name}
                selectedCount={group.values.filter((v) => selectedFilters.includes(v.id)).length}
                open={isSectionOpen(`group-${group.id}`, false)}
                onToggle={() => toggleSection(`group-${group.id}`, false)}
              >
                <ul className="space-y-3">
                  {group.values.map((val) => (
                    <li key={val.id}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={selectedFilters.includes(val.id)} 
                          onChange={() => handleFilterToggle(val.id)} 
                        />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedFilters.includes(val.id) ? 'bg-primary border-primary text-black' : 'border-primary/30 group-hover:border-primary'}`}>
                          {selectedFilters.includes(val.id) && <span className="material-icons-outlined text-xs">check</span>}
                        </div>
                        <span className={`text-sm transition-colors ${selectedFilters.includes(val.id) ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`}>{val.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </FilterSection>
            ))}

            {hasFilters && (
              <button
                className="w-full py-2.5 rounded-xl border border-primary/20 text-text-muted hover:text-primary hover:border-primary text-sm font-medium transition-colors cursor-pointer"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            )}
            {filterOpen && (
              <button
                type="button"
                className="md:hidden sticky bottom-0 w-full py-3 rounded-xl bg-primary text-black font-bold text-sm shadow-lg cursor-pointer"
                onClick={() => setFilterOpen(false)}
              >
                {loading ? 'Updating…' : `Show ${products.length} result${products.length !== 1 ? 's' : ''}`}
              </button>
            )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0" ref={resultsRef}>
            {(activeChips.length > 0 || !loading) && (
              <div className="sticky top-20 z-20 -mx-1 mb-4 px-1 py-2 bg-background-light/90 backdrop-blur border-b border-primary/10 flex flex-wrap items-center gap-2">
                <span className="text-sm text-text-muted mr-1">
                  {loading ? 'Updating results…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
                </span>
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    {chip.label}
                    <span className="material-icons-outlined text-[14px]">close</span>
                  </button>
                ))}
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="ml-auto text-xs font-medium text-text-muted hover:text-primary cursor-pointer">
                    Clear all
                  </button>
                )}
              </div>
            )}
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : error ? (
              <div className="text-center py-20 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 border border-red-800/50">
                  <span className="material-icons-outlined text-3xl text-red-400">error</span>
                </div>
                <p className="text-text-muted">{error}</p>
                <button className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer" onClick={fetchData}>
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
                  <span className="material-icons-outlined text-3xl text-primary">inventory_2</span>
                </div>
                <p className="text-text-muted">No products found</p>
                {hasFilters && (
                  <button className="text-primary hover:text-primary-hover text-sm font-medium cursor-pointer" onClick={clearFilters}>Clear filters</button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
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
                        sellingPrice={variant?.sellingPrice}
                        sellingPriceWithTax={variant?.sellingPriceWithTax}
                        comparePrice={variant?.compareAtPrice ?? undefined}
                        compareAtPriceWithTax={variant?.compareAtPriceWithTax ?? undefined}
                        category={getCategoryName(product)}
                        variantId={variant?.id}
                        variantLabel={getVariantLabel(product)}
                      />
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Shop
