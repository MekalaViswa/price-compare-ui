import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SearchPage from './pages/SearchPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import ComparePage from './pages/ComparePage.jsx'
import { searchStore } from './api.js'
import { STORES, mergeSearch } from './format.js'
import { go } from './router.js'

// Tiny hash router: #/  #/results?q=..  #/product/<id>  #/compare?ids=a,b
function readHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, qs = ''] = raw.split('?')
  return { path, params: new URLSearchParams(qs) }
}

export default function App() {
  const [route, setRoute] = useState(readHash)
  const [search, setSearch] = useState(null)
  const [compareIds, setCompareIds] = useState([])
  const searchId = useRef(0)

  useEffect(() => {
    const onChange = () => {
      setRoute(readHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const runSearch = useCallback((query, platforms, limit, refresh = false) => {
    const id = ++searchId.current
    const key = `${query.toLowerCase()}|${platforms.join(',')}|${limit}`
    setSearch((prev) => {
      if (!prev || prev.key !== key) setCompareIds([])
      return {
        id,
        key,
        query,
        platforms,
        limit,
        stores: Object.fromEntries(platforms.map((p) => [p, { status: 'loading' }])),
      }
    })

    // One request per store, in parallel, so each store's progress is visible
    for (const platform of platforms) {
      const update = (value) =>
        setSearch((s) => (s && s.id === id ? { ...s, stores: { ...s.stores, [platform]: value } } : s))
      searchStore({ query, platform, limit, refresh })
        .then((data) => update({ status: 'done', data }))
        .catch((err) => update({ status: 'failed', error: err.message }))
    }
  }, [])

  // Start a search whenever the results URL asks for one we don't have yet
  const q = route.params.get('q') || ''
  const stores = (route.params.get('stores') || STORES.join(',')).split(',').filter((s) => STORES.includes(s))
  const limit = Math.min(10, Math.max(1, Number(route.params.get('n')) || 2))
  const wantedKey = `${q.toLowerCase()}|${stores.join(',')}|${limit}`

  useEffect(() => {
    if (route.path === '/results' && q.trim().length >= 2 && stores.length && search?.key !== wantedKey) {
      runSearch(q.trim(), stores, limit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.path, wantedKey])

  const merged = useMemo(() => mergeSearch(search), [search])

  const toggleCompare = useCallback((id) => {
    setCompareIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < 3 ? [...ids, id] : ids))
  }, [])

  if (route.path === '/results') {
    return (
      <ResultsPage
        query={q}
        stores={stores}
        limit={limit}
        search={search}
        merged={merged}
        onRefresh={() => runSearch(q.trim(), stores, limit, true)}
        compareIds={compareIds}
        onToggleCompare={toggleCompare}
        onClearCompare={() => setCompareIds([])}
      />
    )
  }
  if (route.path.startsWith('/product/')) {
    const id = decodeURIComponent(route.path.slice('/product/'.length))
    return <ProductPage id={id} search={search} merged={merged} />
  }
  if (route.path === '/compare') {
    const ids = (route.params.get('ids') || '').split(',').filter(Boolean)
    return (
      <ComparePage
        ids={ids.length ? ids : compareIds}
        search={search}
        merged={merged}
        onRemove={(id) => {
          const next = (ids.length ? ids : compareIds).filter((x) => x !== id)
          setCompareIds(next)
          go(`/compare?ids=${next.join(',')}`)
        }}
      />
    )
  }
  return <SearchPage />
}
