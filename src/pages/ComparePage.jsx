import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import ProductImage from '../components/ProductImage.jsx'
import StoreTag from '../components/StoreTag.jsx'
import { getProduct } from '../api.js'
import { resultsUrl } from '../router.js'
import { count, inr, storeName } from '../format.js'

const NOT_LISTED = 'Not listed'

// Each row: how to show a value, and which value counts as "best"
const ROWS = [
  { label: 'Price', value: (p) => p.price, show: inr, best: 'min', big: true },
  { label: 'MRP', value: (p) => p.mrp, show: inr },
  { label: 'Discount', value: (p) => p.discount_percent, show: (v) => `${v}% off`, best: 'max' },
  { label: 'Rating', value: (p) => p.rating, show: (v) => `${v} ★`, best: 'max' },
  { label: 'Number of ratings', value: (p) => p.rating_count, show: count, best: 'max' },
  { label: 'Badge', value: (p) => p.badge, show: (v) => v },
]

export default function ComparePage({ ids, search, merged, onRemove }) {
  const [fetched, setFetched] = useState({})
  const [onlyDiff, setOnlyDiff] = useState(false)

  const known = Object.fromEntries((merged?.results || []).map((r) => [r.id, r]))
  const missing = ids.filter((id) => !known[id] && !fetched[id])

  // Page opened directly: load any product we don't already have
  useEffect(() => {
    missing.forEach((id) =>
      getProduct(id)
        .then((p) => setFetched((f) => ({ ...f, [id]: p })))
        .catch(() => setFetched((f) => ({ ...f, [id]: null })))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')])

  const products = ids.map((id) => known[id] || fetched[id]).filter(Boolean)
  const backHref = search ? `#${resultsUrl(search.query, search.platforms, search.limit)}` : '#/'
  const header = <Header right={<a href={backHref}>← Back to results</a>} />

  if (products.length < 2) {
    return (
      <div className="page">
        {header}
        <main className="container">
          <p className="empty">
            {missing.length ? 'Loading products…' : 'Pick at least 2 products on the results page to compare them.'}
          </p>
        </main>
      </div>
    )
  }

  const rows = ROWS.map((row) => {
    const values = products.map(row.value)
    const present = values.filter((v) => v != null)
    let bestValue = null
    if (row.best && present.length > 1 && new Set(present).size > 1) {
      bestValue = row.best === 'min' ? Math.min(...present) : Math.max(...present)
    }
    const allSame = present.length === values.length && new Set(values).size === 1
    return { ...row, values, bestValue, allSame }
  }).filter((row) => !(onlyDiff && row.allSame))

  const lowest = Math.min(...products.map((p) => p.price ?? Infinity))
  const cols = { gridTemplateColumns: `180px repeat(${products.length}, minmax(220px, 1fr))` }

  return (
    <div className="page">
      {header}
      <main className="container">
        <div className="results-head">
          <div>
            <p className="muted small">Side by side</p>
            <h1 className="page-title">Comparing {products.length} products</h1>
          </div>
          <label className="check">
            <input type="checkbox" checked={onlyDiff} onChange={() => setOnlyDiff(!onlyDiff)} />
            Show only differences
          </label>
        </div>

        <div className="table-scroll">
          <div className="compare" role="table" aria-label="Product comparison" style={{ minWidth: 180 + products.length * 220 }}>
            <div className="compare-row compare-head" role="row" style={cols}>
              <div className="compare-label muted small" role="columnheader">Green is best in row</div>
              {products.map((p) => (
                <div key={p.id} className="compare-cell" role="columnheader">
                  {products.length > 2 && (
                    <button type="button" className="remove" aria-label={`Remove ${p.title} from comparison`} onClick={() => onRemove(p.id)}>
                      ×
                    </button>
                  )}
                  <ProductImage src={p.image} alt={p.title} className="compare-photo" />
                  <StoreTag platform={p.platform} />
                  <a href={`#/product/${encodeURIComponent(p.id)}`} className="clamp-3">{p.title}</a>
                </div>
              ))}
            </div>

            {rows.map((row) => (
              <div key={row.label} className="compare-row" role="row" style={cols}>
                <div className="compare-label" role="rowheader">{row.label}</div>
                {row.values.map((v, i) => {
                  const best = v != null && v === row.bestValue
                  const p = products[i]
                  return (
                    <div key={products[i].id} className="compare-cell" role="cell">
                      <span className={`${row.big ? 'price' : ''} ${v == null ? 'not-listed' : best ? 'good strong' : ''}`}>
                        {v == null ? NOT_LISTED : row.show(v)}
                      </span>
                      {row.big && p.price != null && (
                        <small className={p.price === lowest ? 'good' : 'muted'}>
                          {p.price === lowest ? 'Lowest price' : `+${inr(p.price - lowest)}`}
                        </small>
                      )}
                      {!row.big && best && <small className="good">Best</small>}
                    </div>
                  )
                })}
              </div>
            ))}

            <div className="compare-row" role="row" style={cols}>
              <div className="compare-label" role="rowheader">Highlights</div>
              {products.map((p) => (
                <div key={p.id} className="compare-cell" role="cell">
                  {p.highlights?.length ? (
                    <ul className="compare-list">
                      {p.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="not-listed">{NOT_LISTED}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="compare-row" role="row" style={cols}>
              <div role="cell" />
              {products.map((p) => (
                <div key={p.id} className="compare-cell" role="cell">
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`btn ${p.price === lowest ? 'btn-primary' : 'btn-outline'} btn-block`}
                  >
                    Buy on {storeName(p.platform)}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="muted small">“Not listed” means the store didn't show that detail in its search results.</p>
      </main>
    </div>
  )
}
