import ProductImage from './ProductImage.jsx'
import StoreTag from './StoreTag.jsx'
import Rating from './Rating.jsx'
import { inr, priceNote } from '../format.js'

export default function ProductCard({ product, merged, selected, canSelect, onToggle }) {
  const note = priceNote(product, merged)
  const isLowest = note.good

  return (
    <li className={`card${selected ? ' is-selected' : ''}`}>
      <div className="card-photo">
        <ProductImage src={product.image} alt={product.title} />
        {isLowest && <span className="flag">Lowest price</span>}
      </div>
      <div className="card-body">
        <div className="tag-row">
          <StoreTag platform={product.platform} />
          {product.badge && <span className="badge">{product.badge}</span>}
        </div>
        <a href={`#/product/${encodeURIComponent(product.id)}`} className="card-title" title={product.title}>
          {product.title}
        </a>
        <Rating rating={product.rating} ratingCount={product.rating_count} compact />
        <div className="card-price">
          <span className="price">{product.price_display}</span>
          {product.mrp && <s className="mrp">{inr(product.mrp)}</s>}
          {product.discount_percent != null && <span className="discount">{product.discount_percent}% off</span>}
        </div>
        <span className={`note${note.good ? ' note-good' : ''}`}>{note.text}</span>
        <div className="card-actions">
          <label className="check">
            <input type="checkbox" checked={selected} disabled={!selected && !canSelect} onChange={() => onToggle(product.id)} />
            Compare
          </label>
          <a href={`#/product/${encodeURIComponent(product.id)}`}>Details</a>
        </div>
      </div>
    </li>
  )
}
