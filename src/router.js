// Tiny hash-based navigation, so no router package is needed.
export function go(to) {
  window.location.hash = to
}

export function resultsUrl(query, platforms, limit) {
  const qs = new URLSearchParams({ q: query, stores: platforms.join(','), n: String(limit) })
  return `/results?${qs}`
}
