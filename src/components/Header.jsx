import { useEffect, useState } from 'react'

export default function Header({ query = '', onSearch, right }) {
  const [value, setValue] = useState(query)
  useEffect(() => setValue(query), [query])

  return (
    <header className="site-header">
      <a href="#/" className="brand" aria-label="PriceCompare home">
        <span className="brand-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 17l5-5 4 4 7-8" />
            <path d="M15 8h5v5" />
          </svg>
        </span>
        <span className="brand-name">PriceCompare</span>
      </a>

      {onSearch && (
        <form
          className="header-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            if (value.trim().length >= 2) onSearch(value.trim())
          }}
        >
          <label htmlFor="header-q" className="visually-hidden">Search products</label>
          <input id="header-q" type="search" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search another product" />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      )}

      {right && <div className="header-right">{right}</div>}
    </header>
  )
}
