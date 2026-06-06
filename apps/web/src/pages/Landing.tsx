import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/Skeleton'
import { getFeaturedProducts } from '../api/products.api'
import { getTopCategories } from '../api/categories.api'
import { useAuth } from '../context/AuthContext'
import type { Product } from '../api/products.api'
import type { Category } from '../api/categories.api'

/* ── Scroll‑reveal hook ── */
function useScrollReveal() {
  const observe = useCallback(() => {
    const els = document.querySelectorAll(
      '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
    )
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(observe)
    return () => cancelAnimationFrame(id)
  }, [observe])
}

const Landing: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useScrollReveal()

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingProducts(false)
      return
    }
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          getFeaturedProducts().catch(() => []),
          getTopCategories().catch(() => []),
        ])
        if (Array.isArray(prodData)) {
          setFeaturedProducts(prodData.slice(0, 4))
        }
        if (Array.isArray(catData)) {
          setCategories(catData.slice(0, 3))
        }
      } catch {
        // silently fail for landing page
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchData()
  }, [isAuthenticated])

  const getFirstVariant = (product: Product) => {
    return product.variants?.find((v) => v.isActive) || product.variants?.[0]
  }

  const getProductImage = (product: Product) => {
    if (product.frontImageUrl) return product.frontImageUrl
    const variant = getFirstVariant(product)
    return variant?.image?.url || ''
  }

  // Category images for Shop by Ritual - use predefined images
  const categoryImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBBYA8_O0Eo28Ie9u1fwM2GvVheUGo2g41UJzZWv5CJLQAcnBgyJiCiiH4wkd9c_x5bIsGsZM7eUN-2RNkoWaOpBt1NSzW6odBiaVPp6RA9ihf7NIA-JgR1M82Y0EQk3Uw7R8SjE3YOZ8GQyFoMOecWfxIVC--mKnpH2jSxeEXpJadV4iiAXIKPYFILn-GW1TG0duSKU9ITOkKALNqG4KnnSvNVXIPo7sFVfzcyD-0F4Vhs1m2JGCI9FYjRZ9DettBmUX2aFFPvGA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCSjvQ_p7JCwbHhu2VVqvfVbMjQH7Wdm_GYphZDOtnJjYC9U5krMpbKkLT33OQHDjDMLnqv6GT66LVGv-y1AUCWL783CSqAjjOY2G-fISHwjFh_rKf5qRUni2xeY216RWrWToIFamTmt---Qfbh4KmwQYRfHwDQ7ubuKuGESbyN4IM7IFknm-1qCjYxR3n7OmwaFB3sGmDUHzKc-GIpeNeTTmPTlZcY0JNQXt6QXiq9kTWO8Zehk_TIjmaqloqjrJ_PmiENkVxHcw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC-xpKfna8o6eZlBsPQlYNbkVVREBbITZddRIlquCceXmsWaEGupVWzOFSXqYRJsUDUNZ7X47bv2oerpHHAiN8EZS6vR3xZPh6dXf1Wt9_Y-LHhekVaCoEAP6dsOeLyq4y7OsF--CrVsa49FbLHmxJWJPyQQdLGjbm4c3qkP8bQkF578u2HEir0JFHeezDK6VbQq4h5rlBKJIuLqrsHgpA-nOghX0DKJEEzOEwVpc0qOQm_toCPGg5Q8rG2uFkxymPwYgRlmncLcA',
  ]

  const defaultRitualNames = ['Cleanse & Purify', 'Hydrate & Nourish', 'Treat & Restore']

  return (
    <Layout>
      {/* ════════ Hero Section ════════ */}
      <header className="relative w-full h-[90vh] overflow-hidden flex items-center justify-center">
        <img
          alt="Woman with glowing skin holding natural ingredient"
          className="absolute inset-0 w-full h-full object-cover object-center"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF0EWZk9ZmyUlv_3qPJjW1_-LxDzBPfkD2WETFKMe-PzM5P5Y6tBjoOgG7QgiH6pg8cFzjRdXGqtpJh78VJoBHYrflLythz-nwKZCM6zNs4yIlrLrg2OyQzqMYE0z6GpTJBoQzsc1tiQ4FwsvMt6xElyEzw6jRGU_gYyrXaVPOxiyv9dA5ISfDneXmbLEp9bIr769Tw1zMWS3byDi7k5okS6l6wFSA3Bs8TMg08P2YXHCmBcO1E4_kihsIggMuF0_FSOK6hrJgQA"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <span className="scroll-reveal block text-sm md:text-base uppercase tracking-[0.25em] mb-4 text-primary-light/80">Rooted in Tradition</span>
          <h2 style={{ fontFamily: '"Playfair Display", serif' }} className="scroll-reveal text-5xl md:text-7xl font-medium mb-6 leading-tight">
            The Ritual of <br /> <i className="gold-shimmer" style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }}>Expert-Led</i> Beauty
          </h2>
          <p style={{ fontFamily: 'Lato, sans-serif' }} className="scroll-reveal text-lg md:text-xl font-light mb-10 opacity-90 max-w-xl mx-auto text-stone-300">
            Discover the harmony of ancient Indian botanicals and modern science for radiant, balanced skin.
          </p>
          <div className="scroll-reveal flex flex-col sm:flex-row gap-4 justify-center">
            <button
              style={{ fontFamily: 'Lato, sans-serif' }}
              className="bg-primary hover:bg-primary-hover text-black px-8 py-3.5 rounded-full uppercase tracking-wider text-sm font-bold transition-all shadow-lg glow-gold cursor-pointer"
              onClick={() => navigate('/shop')}
            >
              Shop Collection
            </button>
            <a
              style={{ fontFamily: 'Lato, sans-serif' }}
              className="bg-transparent text-white border border-primary/50 hover:border-primary hover:bg-primary/10 px-8 py-3.5 rounded-full uppercase tracking-wider text-sm font-semibold transition-all cursor-pointer"
              href="#story"
            >
              Our Story
            </a>
          </div>
        </div>
      </header>

      {/* ════════ Trust Badges ════════ */}
      <section className="py-16 bg-surface-dark border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center scroll-stagger">
          <div className="scroll-reveal flex flex-col items-center group">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <span className="material-icons-outlined text-primary text-xl">eco</span>
            </div>
            <h3 style={{ fontFamily: '"Playfair Display", serif' }} className="text-base md:text-lg font-semibold text-text-main-light mb-2">100% Natural Origins</h3>
            <p style={{ fontFamily: 'Lato, sans-serif' }} className="text-sm md:text-base text-text-muted max-w-xs">Sourced directly from organic farms across India.</p>
          </div>
          <div className="scroll-reveal flex flex-col items-center group">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <span className="material-icons-outlined text-primary text-xl">science</span>
            </div>
            <h3 style={{ fontFamily: '"Playfair Display", serif' }} className="text-base md:text-lg font-semibold text-text-main-light mb-2">Clinically Proven</h3>
            <p style={{ fontFamily: 'Lato, sans-serif' }} className="text-sm md:text-base text-text-muted max-w-xs">Formulations backed by dermatological science.</p>
          </div>
          <div className="scroll-reveal flex flex-col items-center group">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <span className="material-icons-outlined text-primary text-xl">volunteer_activism</span>
            </div>
            <h3 style={{ fontFamily: '"Playfair Display", serif' }} className="text-base md:text-lg font-semibold text-text-main-light mb-2">Cruelty Free</h3>
            <p style={{ fontFamily: 'Lato, sans-serif' }} className="text-sm md:text-base text-text-muted max-w-xs">Kind to your skin, kind to animals, always.</p>
          </div>
        </div>
      </section>

      {/* ════════ Best Sellers ════════ */}
      <section className="py-24 max-w-7xl mx-auto px-6" id="shop">
        <div className="scroll-reveal flex justify-between items-end mb-12">
          <div>
            <span className="text-primary text-sm uppercase tracking-widest font-bold">Favorites</span>
            <h2 className="font-display text-4xl font-bold mt-2">Best Sellers</h2>
          </div>
          <a
            className="hidden md:flex items-center text-sm font-bold uppercase tracking-wider text-text-muted hover:text-primary transition-colors group cursor-pointer"
            onClick={() => navigate('/shop')}
          >
            View All Products <span className="material-icons-outlined ml-1 text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-16 space-y-6 bg-surface-dark rounded-2xl border border-primary/10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
              <span className="material-icons-outlined text-3xl text-primary">lock</span>
            </div>
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Sign in to explore our products</h3>
              <p className="text-text-muted">Create an account or login to browse our full collection</p>
            </div>
            <button
              className="bg-primary hover:bg-primary-hover text-black px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all glow-gold cursor-pointer"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </button>
          </div>
        ) : loadingProducts ? (
          <ProductGridSkeleton count={4} />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 scroll-stagger">
            {featuredProducts.map((product) => {
              const variant = getFirstVariant(product)
              return (
                <div key={product.id} className="scroll-reveal">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    imageUrl={getProductImage(product)}
                    price={variant?.price}
                    comparePrice={variant?.compareAtPrice ?? undefined}
                    category={product.categories?.[0]?.name}
                    variantId={variant?.id}
                    variantLabel={variant?.optionValues?.map((ov) => ov.valueName).join(' / ')}
                    badge={product.purchasedCount > 3 ? 'Best Seller' : undefined}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          /* Fallback static products if API returns no featured */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 scroll-stagger">
            {[
              { name: 'Saffron Glow Elixir', cat: 'Brightening & Anti-Aging', price: '₹2,250', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-FT95reHpnfDNFf3JYb0OPkemlQd4Sgo7BvEvCQ0qLJOvtzAeEKvX6q1UN1y2jrh6uv2bPAtWGdy4Vdebk-6IklN4mx45WMdjna77nKqbkpvbaETbfYdOe8aPM2kmxeZxEh9zo27QIUELZB_7HKPRAFV_Jelcif2yms_rGPDqWUvaQNimV-wJHTi8FAa4_nYKdy77hqjucqIJ20c7E7uNJCWefuRKPhz6le9SdYpu3nk-PF937lE4CaSpXM96ysmgfp49gXvC8g', badge: 'Best Seller' },
              { name: 'Kashmir Rose Mist', cat: 'Hydrating & Balancing', price: '₹1,400', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrNG9bL_rBkpQNn-Mp87FxMi0yKrKPpqSPddse-E9B0qoWEUA5V4w4dyKnAxnURZtatLZG4nZD7gMprPKmjQP3aUKajw1YKbG_Abllf299b1rCzBpICny9uqLthxHjNCwB2iTJ3QREMwukatvwFVKu7BxDpMS0KiWFjQXQbStl146hgxzeK14H5ZzLM3ZGBJ14phog2KdtjeedjOVFMbWTfAhQvtombsFQcTBabbYxZXgV603M12bBkPmGxOHEJKxYlH4Ld6dH2g' },
              { name: 'Turmeric Night Repair', cat: 'Restorative & Calming', price: '₹1,900', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWizy3hBLBCQ2d3yRspbgvy55vUB-IJnY8ADH-n65-XGsxBIKw6n_sn80Ntf1BebL2yS1KUsTxAS06fvv_zPnEXD55BZNtxhn3K5jU96YyCIviKOOpAQjVkqbDAJY9AfqhdnstocupvfUte_mzoLKcLuJGA1PcCCy9mpB4qluAanQdVXnsW6chWP5urjniXdc9cE10NlYTYsvt1Bjgk2mVqaoBMYZztwO386mfAtYbqtG8HT_pXogAg1y-Ee7aff3n6SOIpTgUQw' },
              { name: 'Kumkumadi Face Oil', cat: 'Miraculous Glow', price: '₹2,750', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsSVVh6KZGgQU6s1U1jsYFNy4mQNMR0Am00KWlEIr5djdL_E0vfl4wby6L28pxADPG5JCxta52NgACWJq8VINVLn3e4HDhrg--2f-KFXKIAiwiHTBBkHDNkeA4qcJwVd6VSxEyuTLNaT6Id6lc0ph5QGllJjiaESlkpMFywIijA7X0h45jNT7b58ArC-_Lc3I_ISebd6lrmrE_bJxrr0LfY0cJeKKlDQ1yOMM4-V33KL0Q3PNuZLBWFYC53XGJnR1IQavYzj9bAw', badge: 'New' },
            ].map((item, i) => (
              <div key={i} className="group scroll-reveal">
                <div className="relative overflow-hidden rounded-2xl bg-surface-dark aspect-[3/4] mb-4 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all border border-primary/5 hover:border-primary/20">
                  <img alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={item.img} />
                  {item.badge && (
                    <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur px-3 py-1 text-xs uppercase font-bold tracking-wide rounded-full text-black">
                      {item.badge}
                    </div>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold cursor-pointer hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-sm text-text-muted mb-2">{item.cat}</p>
                <span className="font-bold text-lg text-primary">{item.price}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ════════ Our Philosophy ════════ */}
      <section className="py-20 bg-surface-dark border-y border-primary/10" id="story">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full lg:w-1/2 relative scroll-reveal-left">
              <div className="grid grid-cols-2 gap-4">
                <img alt="Ingredients" className="rounded-2xl object-cover h-64 w-full translate-y-8 border border-primary/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL9pAKbxANEavXOBNBQ78L-PdzAFz_x_IIfnpzejDKZLzju8N3OU7IyGA3sToI8S1eNjZFhw5ZtqZx_e993oevxKMWFFgKYePXJ3rBjiBvUnzaMbpDWCYh6pYsZqizqGgnxLHolEv2vZylHJaosTSCRXqt2VMRZ9hQc3DYhyxKQAuTlBCUvbMlGIKfnqjwFWlvv6mJXJdU97xICfPByR4TGaxlyUTWrr-UJWMvR5zmdmLZ1FLsfUA5EixVq4RrBwSE9_lCzsEIFQ" />
                <img alt="Texture" className="rounded-2xl object-cover h-64 w-full border border-primary/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8k-WnH1DRf5iiP7J00B5Rny_NNxki8j4d-oreXig1T-5Z8KOod7aZva_q64PIa_iuP6MCW1WmXDmi85ZLRRABJOwOgXdswI1YYCIFx0VmS1ujEcLvWNLzbKZuTJAgTAIaPdhhwoTGWVkxxD_8k_v9pi7zY_7ZCrsVVDkT_zCY4MaYSEshkeEnUUeVfWf5-G-IQNlEGRnSrcY8Rhpb5M2zMp_W6hjhPh3-Ouc_lHR5c1YiO07RXL4WpkVNvctXGtCVZKNsuRJJ0g" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl z-0 animate-float"></div>
            </div>
            <div className="w-full lg:w-1/2 scroll-reveal-right">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-12 bg-primary"></span>
                <span className="text-primary text-sm uppercase tracking-widest font-bold">Our Philosophy</span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Rooted in Indian <br /> <i className="text-primary">Beauty Traditions</i>
              </h2>
              <p className="text-text-muted mb-6 leading-relaxed">
                Pinak was born from a desire to bring the ancient wisdom of Ayurveda into the modern ritual of self-care. We believe that true beauty is a reflection of inner balance.
              </p>
              <p className="text-text-muted mb-8 leading-relaxed">
                Our formulations blend time-honored ingredients like Saffron, Turmeric, and Rose with contemporary dermatological science to create effective, luxurious skincare that honors your skin and the planet.
              </p>
              <button className="border border-primary/50 px-8 py-3 rounded-full uppercase tracking-wider text-sm font-semibold text-primary hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 cursor-pointer">
                Read Our Full Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Shop by Category ════════ */}
      <section className="py-24 bg-background-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 scroll-reveal">
            <span className="text-primary text-sm uppercase tracking-widest font-bold block mb-2">Curated for you</span>
            <h2 className="font-display text-4xl font-bold">Shop by Ritual</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 scroll-stagger">
            {(categories.length > 0 ? categories : defaultRitualNames.map((name, i) => ({ id: String(i), name, slug: name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') }))).map((cat: any, i: number) => (
              <a
                key={cat.id}
                className="scroll-reveal-scale group relative h-96 rounded-2xl overflow-hidden cursor-pointer border border-primary/5 hover:border-primary/20 transition-all"
                onClick={() => isAuthenticated ? navigate(`/categories/${cat.slug}`) : navigate('/auth')}
              >
                <img
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={cat.categoryImages?.[0]?.url || categoryImages[i % categoryImages.length]}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors"></div>
                <div className="absolute bottom-8 left-8">
                  <h3 className="font-display text-2xl text-white font-bold mb-1">{cat.name}</h3>
                  <span className="text-primary text-sm uppercase tracking-wider group-hover:underline transition-all">Explore →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Newsletter ════════ */}
      <section className="py-20 flex justify-center px-4">
        <div className="scroll-reveal-scale bg-surface-dark p-8 md:p-12 rounded-3xl shadow-2xl shadow-primary/5 max-w-2xl w-full text-center border border-primary/15">
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="material-icons-outlined text-primary text-3xl mb-2 animate-float">spa</span>
            <h2 className="font-display text-3xl font-bold text-text-main-light">Join the Circle</h2>
          </div>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            Sign up for exclusive access to new launches, expert beauty tips, and 10% off your first order.
          </p>
          <form className="space-y-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <input
                className="w-full px-6 py-4 rounded-xl border border-primary/20 bg-background-light focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder-text-muted text-text-main-light"
                placeholder="Enter your email"
                required
                type="email"
              />
            </div>
            <button
              className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl shadow-md transition-all transform hover:scale-[1.01] glow-gold cursor-pointer"
              type="submit"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-xs text-text-muted">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </Layout>
  )
}

export default Landing
