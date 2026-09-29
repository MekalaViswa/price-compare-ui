import { count } from '../format.js'

export default function Rating({ rating, ratingCount, compact = false }) {
  if (rating == null) return null
  return (
    <span className="rating">
      <span className="rating-score">
        {rating}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3 6.5 7 .9-5.1 4.8 1.3 7L12 17.8 5.8 21.2l1.3-7L2 9.4l7-.9z" />
        </svg>
        <span className="visually-hidden"> out of 5</span>
      </span>
      {ratingCount != null && (
        <span className="rating-count">{compact ? `(${count(ratingCount)})` : `${count(ratingCount)} ratings`}</span>
      )}
    </span>
  )
}
