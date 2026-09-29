// All calls to the FastAPI backend live here.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

async function request(path, options) {
  let res
  try {
    res = await fetch(API_URL + path, options)
  } catch {
    throw new Error(`Can't reach the API at ${API_URL}. Check that the server is running.`)
  }

  let body = null
  try {
    body = await res.json()
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    const detail = body?.detail
    let message
    if (detail?.errors?.length) message = detail.errors.map((e) => e.message).join(' ')
    else if (typeof detail === 'string') message = detail
    else if (Array.isArray(detail)) message = detail.map((e) => e.msg).join(' ') // 422 validation
    else message = `The API returned an error (${res.status}).`
    const error = new Error(message)
    error.status = res.status
    throw error
  }
  return body
}

// One store per call, so the UI can show each store finishing separately.
export function searchStore({ query, platform, limit, refresh = false }) {
  return request('/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, platforms: [platform], limit_per_platform: limit, refresh }),
  })
}

export function getProduct(id) {
  return request(`/products/${encodeURIComponent(id)}`)
}
