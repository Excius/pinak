import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/Skeleton'
import { getBestsellers } from '../api/products.api'
import { getTopCategories } from '../api/categories.api'
import type { Product } from '../api/products.api'
import type { Category } from '../api/categories.api'

/* ── Scroll‑reveal hook ── */
function useScrollReveal(deps: unknown[] = []) {
  const observe = useCallback(() => {
    const els = document.querySelectorAll(
      '.scroll-reveal:not(.revealed), .scroll-reveal-left:not(.revealed), .scroll-reveal-right:not(.revealed), .scroll-reveal-scale:not(.revealed)'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    const id = requestAnimationFrame(observe)
    return () => cancelAnimationFrame(id)
  }, [observe])
}

const Landing: React.FC = () => {
  const navigate = useNavigate()
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useScrollReveal([bestsellers, categories, loadingProducts])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          getBestsellers({ timeframe: 'all_time', limit: 4 }).catch(() => []),
          getTopCategories().catch(() => []),
        ])
        if (Array.isArray(prodData)) {
          setBestsellers(prodData.slice(0, 4))
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
  }, [])

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
      <header className="relative w-full min-h-[70vh] md:h-[95vh] overflow-hidden flex items-center justify-center bg-black">
        {/* Dynamic Orbs */}
        <div className="orb w-[300px] h-[300px] bg-primary/40 top-10 left-10"></div>
        <div className="orb w-[500px] h-[500px] bg-primary-dark/30 bottom-10 right-10" style={{ animationDelay: '2s' }}></div>

        {/* Parallax background image */}
        <div className="absolute inset-0 w-full h-full transform scale-105 transition-transform duration-[10s] hover:scale-100">
          <img
            alt="Woman with glowing skin holding natural ingredient"
            className="w-full h-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF0EWZk9ZmyUlv_3qPJjW1_-LxDzBPfkD2WETFKMe-PzM5P5Y6tBjoOgG7QgiH6pg8cFzjRdXGqtpJh78VJoBHYrflLythz-nwKZCM6zNs4yIlrLrg2OyQzqMYE0z6GpTJBoQzsc1tiQ4FwsvMt6xElyEzw6jRGU_gYyrXaVPOxiyv9dA5ISfDneXmbLEp9bIr769Tw1zMWS3byDi7k5okS6l6wFSA3Bs8TMg08P2YXHCmBcO1E4_kihsIggMuF0_FSOK6hrJgQA"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20"></div>

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}

        {/* Glassmorphic floating card */}
        <div className="absolute top-[30%] right-[10%] hidden xl:block glass-panel p-5 rounded-2xl animate-float z-20" style={{ animationDelay: '1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-icons-outlined text-primary">auto_awesome</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">Top Rated</p>
              <p className="text-text-muted text-xs">By Skincare Experts</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[150px] sm:h-[300px] bg-primary/20 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 text-center text-white px-6 sm:px-4 max-w-3xl mx-auto py-16 sm:py-0">
          <span className="scroll-reveal block text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-4 sm:mb-6 text-primary-light/90">Rooted in Tradition</span>
          <h2 className="scroll-reveal font-display text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Ritual of <br /> <i className="gold-shimmer font-display italic font-medium">Expert-Led  </i> Beauty
          </h2>
          <p className="scroll-reveal font-body text-sm sm:text-lg md:text-xl font-light mb-8 sm:mb-10 opacity-90 max-w-xl mx-auto text-stone-300">
            Discover the harmony of ancient Indian botanicals and modern science for radiant, balanced skin.
          </p>
          <div className="scroll-reveal flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-primary hover:bg-primary-hover text-black px-8 py-4 rounded-full uppercase tracking-wider text-xs sm:text-sm font-bold transition-all shadow-[0_0_20px_rgba(200,169,81,0.4)] glow-gold cursor-pointer"
              onClick={() => navigate('/shop')}
            >
              Shop Collection
            </button>
            <a
              className="bg-transparent text-white border border-primary/50 hover:border-primary hover:bg-primary/10 px-8 py-4 rounded-full uppercase tracking-wider text-xs sm:text-sm font-semibold transition-all cursor-pointer glass-panel"
              href="#story"
            >
              Our Story
            </a>
          </div>
        </div>
      </header>

      {/* ════════ Infinite Marquee ════════ */}
      <div className="bg-primary text-black py-4 border-y border-primary-light/30">
        <div className="marquee-container">
          <div className="marquee-content font-bold text-xs sm:text-sm uppercase tracking-widest flex items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <React.Fragment key={i}>
                <span className="mx-8 sm:mx-12">100% Natural Origins</span>
                <span className="text-[10px]">✦</span>
                <span className="mx-8 sm:mx-12">Clinically Proven</span>
                <span className="text-[10px]">✦</span>
                <span className="mx-8 sm:mx-12">Ayurvedic Wisdom</span>
                <span className="text-[10px]">✦</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ Trust Badges ════════ */}
      <section className="py-10 sm:py-16 bg-surface-dark border-b border-primary/10 relative overflow-hidden">
        {/* Connecting line on desktop */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center scroll-stagger relative z-10">
          <div className="scroll-reveal flex flex-col items-center group bg-surface-dark p-4 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(200,169,81,0.2)] transition-all duration-300">
              <span className="material-icons-outlined text-primary text-xl">eco</span>
            </div>
            <h3 className="font-display text-base md:text-lg font-semibold text-text-main-light mb-2">100% Natural Origins</h3>
            <p className="font-body text-sm md:text-base text-text-muted max-w-xs">Sourced directly from organic farms across India.</p>
          </div>
          <div className="scroll-reveal flex flex-col items-center group bg-surface-dark p-6 rounded-2xl glass-card card-lift border border-primary/5">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300">
              <span className="material-icons-outlined text-primary text-2xl">science</span>
            </div>
            <h3 className="font-display text-base md:text-lg font-semibold text-text-main-light mb-2">Clinically Proven</h3>
            <p className="font-body text-sm md:text-base text-text-muted max-w-xs">Formulations backed by dermatological science.</p>
          </div>
          <div className="scroll-reveal flex flex-col items-center group bg-surface-dark p-6 rounded-2xl glass-card card-lift border border-primary/5">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300">
              <span className="material-icons-outlined text-primary text-2xl">volunteer_activism</span>
            </div>
            <h3 className="font-display text-base md:text-lg font-semibold text-text-main-light mb-2">Cruelty Free</h3>
            <p className="font-body text-sm md:text-base text-text-muted max-w-xs">Kind to your skin, kind to animals, always.</p>
          </div>
        </div>
      </section>

      {/* ════════ Best Sellers ════════ */}
      <section className="py-12 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6" id="shop">
        <div className="scroll-reveal flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0 mb-8 sm:mb-12">
          <div>
            <span className="text-primary text-xs sm:text-sm uppercase tracking-widest font-bold">Favorites</span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">Best Sellers</h2>
          </div>
          <a
            className="flex items-center text-xs sm:text-sm font-bold uppercase tracking-wider text-text-muted hover:text-primary transition-colors group cursor-pointer"
            onClick={() => navigate('/shop')}
          >
            View All Products <span className="material-icons-outlined ml-1 text-base sm:text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
        </div>

        {loadingProducts ? (
          <ProductGridSkeleton count={4} />
        ) : bestsellers.length > 0 ? (
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 scroll-stagger hide-scrollbar grab-scroll pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
            {bestsellers.map((product) => {
              const variant = getFirstVariant(product)
              return (
                <div key={product.id} className="scroll-reveal shrink-0 w-[75vw] sm:w-auto">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    imageUrl={getProductImage(product)}
                    price={variant?.price}
                    priceWithTax={variant?.priceWithTax}
                    comparePrice={variant?.compareAtPrice ?? undefined}
                    compareAtPriceWithTax={variant?.compareAtPriceWithTax ?? undefined}
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
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 scroll-stagger hide-scrollbar grab-scroll pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
            {[
              { name: 'Saffron Glow Elixir', cat: 'Brightening & Anti-Aging', price: '₹2,250', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-FT95reHpnfDNFf3JYb0OPkemlQd4Sgo7BvEvCQ0qLJOvtzAeEKvX6q1UN1y2jrh6uv2bPAtWGdy4Vdebk-6IklN4mx45WMdjna77nKqbkpvbaETbfYdOe8aPM2kmxeZxEh9zo27QIUELZB_7HKPRAFV_Jelcif2yms_rGPDqWUvaQNimV-wJHTi8FAa4_nYKdy77hqjucqIJ20c7E7uNJCWefuRKPhz6le9SdYpu3nk-PF937lE4CaSpXM96ysmgfp49gXvC8g', badge: 'Best Seller' },
              { name: 'Kashmir Rose Mist', cat: 'Hydrating & Balancing', price: '₹1,400', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrNG9bL_rBkpQNn-Mp87FxMi0yKrKPpqSPddse-E9B0qoWEUA5V4w4dyKnAxnURZtatLZG4nZD7gMprPKmjQP3aUKajw1YKbG_Abllf299b1rCzBpICny9uqLthxHjNCwB2iTJ3QREMwukatvwFVKu7BxDpMS0KiWFjQXQbStl146hgxzeK14H5ZzLM3ZGBJ14phog2KdtjeedjOVFMbWTfAhQvtombsFQcTBabbYxZXgV603M12bBkPmGxOHEJKxYlH4Ld6dH2g' },
              { name: 'Turmeric Night Repair', cat: 'Restorative & Calming', price: '₹1,900', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWizy3hBLBCQ2d3yRspbgvy55vUB-IJnY8ADH-n65-XGsxBIKw6n_sn80Ntf1BebL2yS1KUsTxAS06fvv_zPnEXD55BZNtxhn3K5jU96YyCIviKOOpAQjVkqbDAJY9AfqhdnstocupvfUte_mzoLKcLuJGA1PcCCy9mpB4qluAanQdVXnsW6chWP5urjniXdc9cE10NlYTYsvt1Bjgk2mVqaoBMYZztwO386mfAtYbqtG8HT_pXogAg1y-Ee7aff3n6SOIpTgUQw' },
              { name: 'Kumkumadi Face Oil', cat: 'Miraculous Glow', price: '₹2,750', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsSVVh6KZGgQU6s1U1jsYFNy4mQNMR0Am00KWlEIr5djdL_E0vfl4wby6L28pxADPG5JCxta52NgACWJq8VINVLn3e4HDhrg--2f-KFXKIAiwiHTBBkHDNkeA4qcJwVd6VSxEyuTLNaT6Id6lc0ph5QGllJjiaESlkpMFywIijA7X0h45jNT7b58ArC-_Lc3I_ISebd6lrmrE_bJxrr0LfY0cJeKKlDQ1yOMM4-V33KL0Q3PNuZLBWFYC53XGJnR1IQavYzj9bAw', badge: 'New' },
            ].map((item, i) => (
              <div key={i} className="group scroll-reveal shrink-0 w-[75vw] sm:w-auto card-lift">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-surface-dark aspect-[3/4] mb-3 sm:mb-4 shadow-sm transition-all border border-primary/5 hover:border-primary/20 img-zoom cursor-pointer">
                  <img alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={item.img} />
                  {item.badge && (
                    <div className="absolute top-3 left-3 badge-shimmer backdrop-blur px-3 py-1 text-xs uppercase font-bold tracking-wide rounded-full text-black shadow-sm">
                      {item.badge}
                    </div>
                  )}
                </div>
                <h3 className="font-display text-sm sm:text-lg font-semibold cursor-pointer hover:text-primary transition-colors truncate">{item.name}</h3>
                <p className="text-xs sm:text-sm text-text-muted mb-1 sm:mb-2">{item.cat}</p>
                <span className="font-bold text-sm sm:text-lg text-primary price-glow">{item.price}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ════════ Our Philosophy ════════ */}
      <section className="py-12 sm:py-20 bg-surface-dark border-y border-primary/10" id="story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-20">
            <div className="w-full lg:w-1/2 relative scroll-reveal-left">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <img alt="Ingredients" className="rounded-xl sm:rounded-2xl object-cover h-40 sm:h-64 w-full translate-y-4 sm:translate-y-8 border border-primary/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL9pAKbxANEavXOBNBQ78L-PdzAFz_x_IIfnpzejDKZLzju8N3OU7IyGA3sToI8S1eNjZFhw5ZtqZx_e993oevxKMWFFgKYePXJ3rBjiBvUnzaMbpDWCYh6pYsZqizqGgnxLHolEv2vZylHJaosTSCRXqt2VMRZ9hQc3DYhyxKQAuTlBCUvbMlGIKfnqjwFWlvv6mJXJdU97xICfPByR4TGaxlyUTWrr-UJWMvR5zmdmLZ1FLsfUA5EixVq4RrBwSE9_lCzsEIFQ" />
                <img alt="Texture" className="rounded-xl sm:rounded-2xl object-cover h-40 sm:h-64 w-full border border-primary/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8k-WnH1DRf5iiP7J00B5Rny_NNxki8j4d-oreXig1T-5Z8KOod7aZva_q64PIa_iuP6MCW1WmXDmi85ZLRRABJOwOgXdswI1YYCIFx0VmS1ujEcLvWNLzbKZuTJAgTAIaPdhhwoTGWVkxxD_8k_v9pi7zY_7ZCrsVVDkT_zCY4MaYSEshkeEnUUeVfWf5-G-IQNlEGRnSrcY8Rhpb5M2zMp_W6hjhPh3-Ouc_lHR5c1YiO07RXL4WpkVNvctXGtCVZKNsuRJJ0g" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl z-0 animate-float"></div>
            </div>
            <div className="w-full lg:w-1/2 scroll-reveal-right">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-12 bg-primary"></span>
                <span className="text-primary text-sm uppercase tracking-widest font-bold">Our Philosophy</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                Rooted in Indian <br /> <i className="text-primary">Beauty Traditions</i>
              </h2>
              <p className="text-text-muted mb-6 leading-relaxed">
                Pinak was born from a desire to bring the ancient wisdom of Ayurveda into the modern ritual of self-care. We believe that true beauty is a reflection of inner balance.
              </p>
              <p className="text-text-muted mb-8 leading-relaxed">
                Our formulations blend time-honored ingredients like Saffron, Turmeric, and Rose with contemporary dermatological science to create effective, luxurious skincare that honors your skin and the planet.
              </p>
              <button className="border-2 border-primary/50 px-8 py-3 rounded-full uppercase tracking-wider text-sm font-semibold text-primary hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(200,169,81,0.1)] hover:shadow-[0_0_20px_rgba(200,169,81,0.3)]">
                Read Our Full Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Shop by Category ════════ */}
      <section className="py-12 sm:py-24 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-16 scroll-reveal">
            <span className="text-primary text-xs sm:text-sm uppercase tracking-widest font-bold block mb-2">Curated for you</span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold">Shop by Ritual</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 scroll-stagger">
            {/* The first category */}
            {(() => {
              const displayCats = categories.length > 0 ? categories : defaultRitualNames.map((name, i) => ({ id: String(i), name, slug: name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'), categoryImages: [{ url: categoryImages[i % categoryImages.length] }] }))
              return (
                <>
                  {displayCats[0] && (
                    <a
                      key={displayCats[0].id}
                      className="scroll-reveal-scale group relative h-72 md:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border border-primary/10 hover:border-primary/40 transition-all shadow-lg hover:shadow-primary/10"
                      onClick={() => navigate(`/categories/${displayCats[0]?.slug}`)}
                    >
                      <img
                        alt={displayCats[0].name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                        src={displayCats[0].categoryImages?.[0]?.url || categoryImages[0]}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-500"></div>
                      <div className="absolute bottom-6 left-6 right-6 p-5 glass-panel rounded-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <h3 className="font-display text-xl md:text-2xl text-white font-bold mb-1">{displayCats[0].name}</h3>
                        <span className="text-primary text-xs uppercase tracking-widest font-bold">Explore Collection →</span>
                      </div>
                      <div className="absolute top-6 left-6 group-hover:opacity-0 transition-opacity duration-300">
                        <h3 className="font-display text-xl md:text-2xl text-white font-bold text-shadow">{displayCats[0].name}</h3>
                      </div>
                    </a>
                  )}

                  {/* The second category */}
                  {displayCats[1] && (
                    <a
                      key={displayCats[1].id}
                      className="scroll-reveal-scale group relative h-72 md:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border border-primary/10 hover:border-primary/40 transition-all shadow-lg hover:shadow-primary/10"
                      onClick={() => navigate(`/categories/${displayCats[1]?.slug}`)}
                    >
                      <img
                        alt={displayCats[1].name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                        src={displayCats[1].categoryImages?.[0]?.url || categoryImages[1]}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-500"></div>
                      <div className="absolute bottom-6 left-6 right-6 p-5 glass-panel rounded-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <h3 className="font-display text-xl md:text-2xl text-white font-bold mb-1">{displayCats[1].name}</h3>
                        <span className="text-primary text-xs uppercase tracking-widest font-bold">Explore Collection →</span>
                      </div>
                      <div className="absolute top-6 left-6 group-hover:opacity-0 transition-opacity duration-300">
                        <h3 className="font-display text-xl md:text-2xl text-white font-bold text-shadow">{displayCats[1].name}</h3>
                      </div>
                    </a>
                  )}

                  {/* The third category */}
                  {displayCats[2] && (
                    <a
                      key={displayCats[2].id}
                      className="scroll-reveal-scale group relative h-72 md:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border border-primary/10 hover:border-primary/40 transition-all shadow-lg hover:shadow-primary/10"
                      onClick={() => navigate(`/categories/${displayCats[2]?.slug}`)}
                    >
                      <img
                        alt={displayCats[2].name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                        src={displayCats[2].categoryImages?.[0]?.url || categoryImages[2]}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-500"></div>
                      <div className="absolute bottom-6 left-6 right-6 p-5 glass-panel rounded-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <h3 className="font-display text-xl md:text-2xl text-white font-bold mb-1">{displayCats[2].name}</h3>
                        <span className="text-primary text-xs uppercase tracking-widest font-bold">Explore Collection →</span>
                      </div>
                      <div className="absolute top-6 left-6 group-hover:opacity-0 transition-opacity duration-300">
                        <h3 className="font-display text-xl md:text-2xl text-white font-bold text-shadow">{displayCats[2].name}</h3>
                      </div>
                    </a>
                  )}

                  {/* Call to action decorative banner */}
                  <div
                    className="scroll-reveal-scale relative md:col-span-3 rounded-2xl sm:rounded-3xl overflow-hidden bg-primary p-6 md:p-10 flex flex-col md:flex-row items-center justify-between cursor-pointer group hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(200,169,81,0.2)] mt-2"
                    onClick={() => navigate('/shop')}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500 shrink-0">
                        <span className="material-icons-outlined text-black text-3xl">star</span>
                      </div>
                      <div>
                        <h3 className="font-display text-2xl md:text-3xl text-black font-bold mb-1 leading-tight">Discover All Rituals</h3>
                        <p className="text-black/80 font-medium text-sm">Explore our complete collection of Ayurvedic formulations.</p>
                      </div>
                    </div>
                    <span className="mt-6 md:mt-0 bg-black text-white px-8 py-3 rounded-full text-sm uppercase tracking-widest font-bold group-hover:scale-105 transition-transform">
                      Shop Now
                    </span>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </section>

      {/* ════════ Newsletter ════════ */}
      <section className="py-12 sm:py-20 flex justify-center px-4">
        <div className="scroll-reveal-scale bg-surface-dark p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl shadow-2xl shadow-primary/5 max-w-2xl w-full text-center border border-primary/15">
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="material-icons-outlined text-primary text-3xl mb-2 animate-float">spa</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-main-light">Join the Circle</h2>
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
              className="group relative w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl shadow-md transition-all transform hover:scale-[1.01] glow-gold cursor-pointer overflow-hidden"
              type="submit"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10">Subscribe</span>
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
