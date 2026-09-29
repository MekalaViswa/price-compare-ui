import { useState } from 'react'
import Header from '../components/Header.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductImage from '../components/ProductImage.jsx'
import StoreTag from '../components/StoreTag.jsx'
import Notice from '../components/Notice.jsx'
import { go, resultsUrl } from '../router.js'
import { inr, storeName, timeLabel } from '../format.js'

function StoreProgress({ search }) {
  return (
    <div className="progress-grid">
      {search.platforms.map((p) => {
        const s = search.stores[p]
        const status =
          s.status === 'loading' ? 'Searching…' : s.status === 'failed' ? "Couldn't check" : `Done, ${s.data.results.length} found`
        return (
          <div key={p} className={`progress-card is-${s.status}`}>
            <div className="progress-head">
              <strong>{storeName(p)}</strong>
              <span>{status}</span>
            </div>
            <div className="bar" aria-hidden="true"><span /></div>
          </div>
        )
      })}
    </div>
  )
}

function BestPrice({ merged }) {
  const { winners, tie, lowest, saving } = merged
  if (!winners.length) return null
  const best = winners[0]

  return (
    <section className="best" aria-label="Best price">
      <div className="best-side">
        <span className="best-label">{tie ? 'Same price' : 'Cheapest'}</span>
        <div>
          <span className="best-price">{inr(lowest)}</span>
          <span className="best-where">on {winners.map((w) => storeName(w.platform)).join(' and ')}</span>
        </div>
      </div>

      {tie ? (
        <div className="best-main">
          <p className="muted">No difference in price. Pick the store you prefer for delivery, offers or returns.</p>
          <div className="best-options">
            {winners.map((w) => (
              <div key={w.id} className="best-option">
                <ProductImage src={w.image} alt={w.title} className="thumb" />
                <div className="best-option-body">
                  <StoreTag platform={w.platform} />
                  <a href={`#/product/${encodeURIComponent(w.id)}`} className="clamp-2">{w.title}</a>
                  <a href={w.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">View on {storeName(w.platform)}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="best-main best-single">
          <ProductImage src={best.image} alt={best.title} className="thumb-lg" />
          <div className="best-info">
            <StoreTag platform={best.platform} />
            <a href={`#/product/${encodeURIComponent(best.id)}`} className="best-title clamp-2">{best.title}</a>
            {saving && (
              <p className="good">
                {inr(saving.amount)} less than the best {storeName(saving.store)} price
              </p>
            )}
            <a href={best.link} target="_blank" rel="noreferrer" className="btn btn-primary">
              View on {storeName(best.platform)}
            </a>
          </div>
        </div>
      )}
    </section>
  )
}

export default function ResultsPage({ query, stores, limit, search, merged, onRefresh, compareIds, onToggleCompare, onClearCompare }) {
  const [filter, setFilter] = useState('all')

  if (!search || !merged) {
    return (
      <div className="page">
        <Header query={query} onSearch={(q) => go(resultsUrl(q, stores, limit))} />
        <main className="container"><p className="muted">Starting search…</p></main>
      </div>
    )
  }

  const { loading, results, errors } = merged
  const visible = results.filter((r) => filter === 'all' || r.platform === filter)
  const selected = results.filter((r) => compareIds.includes(r.id))
  const allFailed = !loading && !results.length && errors.length > 0

  return (
    <div className="page">
      <Header query={query} onSearch={(q) => go(resultsUrl(q, stores, limit))} />

      <main className={`container results${selected.length ? ' has-tray' : ''}`}>
        <div className="results-head">
          <div>
            <p className="muted small">{loading ? 'Checking prices for' : `${results.length} results for`}</p>
            <h1 className="page-title">{search.query}</h1>
          </div>
          {!loading && results.length > 0 && (
            <div className="results-meta">
              {merged.cached && <span className="pill">Saved result</span>}
              <span className="muted small">Updated {timeLabel(merged.scrapedAt)}</span>
              <button type="button" className="btn btn-outline btn-sm" onClick={onRefresh}>Refresh prices</button>
            </div>
          )}
        </div>

        {loading && (
          <>
            <p className="muted">Searching {search.platforms.map(storeName).join(' and ')} at the same time. This usually takes 10–30 seconds.</p>
            <StoreProgress search={search} />
          </>
        )}

        {errors.map((e) => (
          <Notice
            key={e.platform}
            title={`${storeName(e.platform)} couldn't be checked.`}
            action={<button type="button" className="btn btn-outline btn-sm" onClick={onRefresh}>Try again</button>}
          >
            {e.message}
          </Notice>
        ))}

        {allFailed && <p className="empty">No prices to show yet. Try again in a minute, or search for something else.</p>}

        {!loading && !results.length && !errors.length && (
          <p className="empty">
            No products found for “{search.query}”. Try a shorter search, like “LG washing machine”.
          </p>
        )}

        {!loading && <BestPrice merged={merged} />}

        {results.length > 0 && (
          <>
            <div className="list-head">
              <h2 className="section-title">All results, lowest price first</h2>
              <div className="segmented" role="group" aria-label="Filter by store">
                {['all', ...search.platforms].map((f) => (
                  <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                    {f === 'all' ? 'All stores' : storeName(f)}
                  </button>
                ))}
              </div>
            </div>
            <p className="muted small">Tick up to 3 products to compare them side by side.</p>
            <ul className="grid">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  merged={merged}
                  selected={compareIds.includes(p.id)}
                  canSelect={compareIds.length < 3}
                  onToggle={onToggleCompare}
                />
              ))}
            </ul>
          </>
        )}
      </main>

      {selected.length > 0 && (
        <div className="tray" role="region" aria-label="Compare tray">
          <span className="tray-count">
            {selected.length} of 3 selected
          </span>
          <div className="tray-items">
            {selected.map((p) => (
              <span key={p.id} className="tray-item">
                <ProductImage src={p.image} alt="" className="tray-thumb" />
                <span>
                  <strong>{p.price_display}</strong>
                  <small>{storeName(p.platform)}</small>
                </span>
              </span>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClearCompare}>Clear</button>
          <button
            type="button"
            className="btn btn-gold"
            disabled={selected.length < 2}
            onClick={() => go(`/compare?ids=${selected.map((p) => p.id).join(',')}`)}
          >
            {selected.length < 2 ? 'Pick one more' : 'Compare now'}
          </button>
        </div>
      )}
    </div>
  )
}
