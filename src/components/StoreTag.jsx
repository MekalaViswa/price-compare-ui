import { storeName } from '../format.js'

export default function StoreTag({ platform }) {
  return <span className={`store-tag store-${platform}`}>{storeName(platform)}</span>
}
