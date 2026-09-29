# PriceCompare UI (React)

React frontend for the `price-compare-api` FastAPI backend.
Only 2 runtime packages: `react` and `react-dom` (plus `vite` for development).
No router, no UI library, no state library. Plain CSS.

## Run

1. Start the API first (in the `price-compare-api` folder):
   `uvicorn app.main:app --host 127.0.0.1 --port 8000`
2. Windows: double-click `run.bat`. Or:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

Needs Node.js 18 or newer (`node --version`).

If the API runs somewhere else, change `VITE_API_URL` in `.env` and restart `npm run dev`.

## Screens

| URL | Screen |
|---|---|
| `#/` | Search |
| `#/results?q=...&stores=amazon,flipkart&n=2` | Progress while searching, then best price + results grid |
| `#/product/<id>` | Product details |
| `#/compare?ids=<id>,<id>` | Side-by-side comparison (2 or 3 products) |

## Project structure

```
src/
├── main.jsx            # entry point
├── App.jsx             # routing + search state + compare selection
├── router.js           # go() and resultsUrl() helpers
├── api.js              # fetch calls to FastAPI (/compare, /products/{id})
├── format.js           # ₹ formatting, merging store responses, price notes
├── styles.css          # all styles + design tokens
├── components/         # Header, ProductCard, ProductImage, Rating, StoreTag, Notice
└── pages/              # SearchPage, ResultsPage, ProductPage, ComparePage
```

## How it uses the API

- A search sends **one `POST /compare` per store in parallel**
  (`"platforms": ["amazon"]` and `"platforms": ["flipkart"]`), so each store's
  progress shows separately. The two responses are merged in `format.js`.
- "Refresh prices" sends the same requests with `"refresh": true`.
- The product and compare pages use products already in memory. If you open
  or reload those URLs directly, they call `GET /products/{id}` instead.

## Common problems

- **"Can't reach the API at http://127.0.0.1:8000"**: the FastAPI server isn't running.
- **CORS error in the browser console**: add `http://localhost:5173` to
  `CORS_ORIGINS` in the API's `.env` and restart the API.
- **Product page says "Product not found"** after a reload: the API only keeps
  results for 10 minutes. Search again.
