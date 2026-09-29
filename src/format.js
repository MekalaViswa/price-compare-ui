export const STORES = ['amazon', 'flipkart']

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export const inr = (n) => (n == null ? null : inrFormatter.format(n))
export const count = (n) => (n == null ? null : n.toLocaleString('en-IN'))
export const storeName = (p) => (p === 'amazon' ? 'Amazon' : p === 'flipkart' ? 'Flipkart' : p)

export function timeLabel(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

// Combine the per-store responses into one view model for the pages.
export function mergeSearch(search) {
  if (!search) return null
  const results = []
  const errors = []
  let scrapedAt = null
  let allCached = true
  let loading = false

  for (const platform of search.platforms) {
    const store = search.stores[platform]
    if (!store || store.status === 'loading') {
      loading = true
      continue
    }
    if (store.status === 'failed') {
      errors.push({ platform, message: store.error })
      continue
    }
    const data = store.data
    results.push(...data.results)
    errors.push(...data.errors)
    if (!scrapedAt || data.scraped_at > scrapedAt) scrapedAt = data.scraped_at
    if (!data.cached) allCached = false
  }

  const sorted = [...results].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
  const priced = sorted.filter((r) => r.price != null)
  const lowest = priced.length ? priced[0].price : null

  // First product per store at the lowest price
  const winners = []
  for (const r of priced) {
    if (r.price === lowest && !winners.some((w) => w.platform === r.platform)) winners.push(r)
  }
  const samePriceEverywhere = priced.length > 1 && priced.every((r) => r.price === lowest)

  // Saving vs. the cheapest product on the other store(s)
  let saving = null
  if (winners.length === 1) {
    const others = priced.filter((r) => r.platform !== winners[0].platform)
    if (others.length) saving = { amount: others[0].price - lowest, store: others[0].platform }
  }

  return {
    loading,
    results: sorted,
    errors,
    lowest,
    winners,
    tie: winners.length > 1,
    samePriceEverywhere,
    saving,
    scrapedAt,
    cached: results.length > 0 && allCached,
  }
}

export function priceNote(product, merged) {
  if (product.price == null || merged.lowest == null) return { text: 'Price not shown', good: false }
  if (merged.samePriceEverywhere) return { text: 'Same price on every store', good: false }
  if (product.price === merged.lowest) return { text: 'Lowest price', good: true }
  return { text: `${inr(product.price - merged.lowest)} more than the lowest`, good: false }
}
