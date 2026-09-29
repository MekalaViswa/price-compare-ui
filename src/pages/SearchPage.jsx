import { useState } from 'react'
import Header from '../components/Header.jsx'
import { go, resultsUrl } from '../router.js'
import { STORES, storeName } from '../format.js'

const EXAMPLES = ['LG 7kg top loading washing machine', 'iPhone 16 128GB', 'Sony WH-1000XM5']

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [stores, setStores] = useState(STORES)
  const [limit, setLimit] = useState(2)
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 2) return setError('Type at least 2 characters, for example "LG washing machine".')
    if (!stores.length) return setError('Pick at least one store to search.')
    go(resultsUrl(q, stores, limit))
  }

  const toggleStore = (s) => setStores((list) => (list.includes(s) ? list.filter((x) => x !== s) : STORES.filter((x) => x === s || list.includes(x))))

  return (
    <div className="page">
      <Header right={<span className="muted small">Amazon India and Flipkart</span>} />
      <main className="search-hero">
        <h1 className="hero-title">
          Find the lowest price,
          <br />
          without opening ten tabs.
        </h1>
        <p className="hero-sub">Search once. We check Amazon and Flipkart and show you which one is cheaper.</p>

        <form className="search-form" onSubmit={submit} noValidate>
          <label htmlFor="q" className="field-label">What are you looking for?</label>
          <div className="search-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              id="q"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setError('')
              }}
              placeholder="e.g. LG 7kg top loading washing machine"
              aria-describedby={error ? 'q-error' : undefined}
              autoFocus
            />
            <button type="submit" className="btn btn-primary btn-lg">Compare prices</button>
          </div>
          {error && <p id="q-error" className="field-error">{error}</p>}

          <div className="search-options">
            <fieldset className="stores">
              <legend>Search on</legend>
              {STORES.map((s) => (
                <label key={s} className="check">
                  <input type="checkbox" checked={stores.includes(s)} onChange={() => toggleStore(s)} />
                  {storeName(s)}
                </label>
              ))}
            </fieldset>
            <label className="muted small inline-field">
              Results per store
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                {[1, 2, 3, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>
        </form>

        <div className="examples">
          <span className="muted small">Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip" onClick={() => setQuery(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </main>
      <footer className="site-footer">Prices are fetched live, so a search can take 10–30 seconds.</footer>
    </div>
  )
}
