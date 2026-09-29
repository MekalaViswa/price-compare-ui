export default function Notice({ title, children, action }) {
  return (
    <div className="notice" role="status">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l10 18H2L12 3z" />
        <path d="M12 10v4" />
        <path d="M12 17.5v.5" />
      </svg>
      <p>
        <strong>{title}</strong> {children}
      </p>
      {action}
    </div>
  )
}
