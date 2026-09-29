import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import ProductImage from '../components/ProductImage.jsx'
import StoreTag from '../components/StoreTag.jsx'
import Rating from '../components/Rating.jsx'
import { getProduct } from '../api.js'
import { go, resultsUrl } from '../router.js'
import { inr, storeName, timeLabel } from '../format.js'

export default function ProductPage({ id, search, merged }) {
  const fromSearch = merged?.results.find((r) => r.id === id) || null
  const [fetched, setFetched] = useState(null)
  const [error, setError] = useState('')
  const product = fromSearch || fetched

  // Opened directly (e.g. page refresh): ask the API for it
  useEffect(() => {
    if (fromSearch) return
    let active = true
    setError('')
    getProduct(id)
      .then((p) => active && setFetched(p))
      .catch((e) => active && setError(e.message))
    return () => {
      active = false
    }
  }, [id, fromSearch])

  const backHref = search ? `#${resultsUrl(search.query, search.platforms, search.limit)}` : '#/'
  const header = <Header query={search?.query || ''} onSearch={(q) => go(resultsUrl(q, ['amazon', 'flipkart'], 2))} />

  if (!product) {
    return (
      <div className="page">
        {header}
        <main className="container">
          <a href={backHref} className="back">← Back to results</a>
          {error ? <p className="empty">{error}</p> : <p className="muted">Loading product…</p>}
        </main>
      </div>
    )
  }

  const lowest = merged?.lowest
  const isLowest = lowest != null && product.price === lowest && fromSearch
  const others = fromSearch ? merged.results.filter((r) => r.id !== product.id) : []
  const cheapestOther = others.filter((r) => r.platform !== product.platform && r.price != null)[0]

  let compareLine = null
  if (fromSearch && cheapestOther) {
    const diff = cheapestOther.price - product.price
    compareLine =
      diff > 0
        ? { good: true, text: `${inr(diff)} less than the best ${storeName(cheapestOther.platform)} price` }
        : diff < 0
          ? { good: false, text: `${inr(-diff)} more than the best ${storeName(cheapestOther.platform)} price` }
          : { good: false, text: `Same price as the best ${storeName(cheapestOther.platform)} result` }
  }

  const copyLink = () => navigator.clipboard?.writeText(product.link)

  return (
    <div className="page">
      {header}
      <main className="container product">
        <a href={backHref} className="back">← Back to results</a>

        <div className="product-top">
          <ProductImage src={product.image} alt={product.title} className="product-photo" />

          <div className="product-info">
            <div className="tag-row">
              <StoreTag platform={product.platform} />
              {product.badge && <span className="badge">{product.badge}</span>}
            </div>
            <h1 className="product-title">{product.title}</h1>
            <Rating rating={product.rating} ratingCount={product.rating_count} />

            <div className="price-box">
              <div className="price-line">
                <span className="price-xl">{product.price_display}</span>
                {product.mrp && <s className="mrp-lg">{inr(product.mrp)}</s>}
                {product.discount_percent != null && <span className="discount-lg">{product.discount_percent}% off</span>}
              </div>
              {isLowest && !merged.samePriceEverywhere && <p className="good">Lowest price in your search</p>}
              {compareLine && <p className={compareLine.good ? 'good' : 'muted'}>{compareLine.text}</p>}
            </div>

            {product.highlights?.length > 0 && (
              <div className="highlights">
                <h2 className="small-title">Highlights</h2>
                <ul>
                  {product.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="actions">
              <a href={product.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
                Buy on {storeName(product.platform)}
              </a>
              <button type="button" className="btn btn-outline btn-lg" onClick={copyLink}>Copy link</button>
            </div>
            {merged?.scrapedAt && (
              <p className="muted small">
                Price checked at {timeLabel(merged.scrapedAt)}. It may have changed on {storeName(product.platform)} since.
              </p>
            )}
          </div>
        </div>

        {others.length > 0 && (
          <section>
            <h2 className="section-title">Other results from this search</h2>
            <ul className="mini-grid">
              {others.map((o) => (
                <li key={o.id} className="mini-card">
                  <ProductImage src={o.image} alt={o.title} className="thumb" />
                  <div className="mini-body">
                    <StoreTag platform={o.platform} />
                    <a href={`#/product/${encodeURIComponent(o.id)}`} className="clamp-2">{o.title}</a>
                    <div className="mini-price">
                      <strong>{o.price_display}</strong>
                      {product.price != null && o.price != null && o.price !== product.price && (
                        <span className="muted small">
                          {o.price > product.price ? '+' : '−'}
                          {inr(Math.abs(o.price - product.price))}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
