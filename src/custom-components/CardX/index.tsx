interface CardXProps {
  title?: string
  description?: string
  imageUrl?: string
  variant?: 'default' | 'bordered' | 'elevated'
  size?: 'sm' | 'md' | 'lg'
  badge?: string
  badgeColor?: 'purple' | 'green' | 'red' | 'blue'
  /**
   * Controls which optional sections render.
   * Omit (or pass undefined) to show everything.
   * Pass an array to show only those sections:
   *   'image'       — the image / placeholder area
   *   'badge'       — the coloured badge chip
   *   'description' — the body text below the title
   */
  visibleFields?: Array<'image' | 'badge' | 'description'>
}

const sizes = {
  sm: { width: 200, padding: 12, titleSize: 13, descSize: 11 },
  md: { width: 260, padding: 16, titleSize: 15, descSize: 12 },
  lg: { width: 320, padding: 20, titleSize: 17, descSize: 13 },
}

const badgeColors = {
  purple: { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  green:  { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)'  },
  red:    { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.3)'  },
  blue:   { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
}

export default function CardX({
  title        = 'Card Title',
  description  = 'This is a card description.',
  imageUrl     = '',
  variant      = 'default',
  size         = 'md',
  badge        = '',
  badgeColor   = 'purple',
  visibleFields,          // undefined → show everything
}: CardXProps) {
  const s  = sizes[size]       ?? sizes.md
  const bc = badgeColors[badgeColor] ?? badgeColors.purple

  // Helper: if visibleFields is undefined every field is visible;
  // otherwise only fields listed in the array are shown.
  const show = (field: 'image' | 'badge' | 'description') =>
    !visibleFields || visibleFields.includes(field)

  const borderStyle = {
    default:  '1px solid #2e3148',
    bordered: '2px solid #6366f1',
    elevated: '1px solid #2e3148',
  }[variant]

  const shadowStyle = {
    default:  'none',
    bordered: 'none',
    elevated: '0 8px 24px rgba(0,0,0,0.4)',
  }[variant]

  return (
    <div
      style={{
        width: s.width,
        background: '#1e2130',
        border: borderStyle,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: shadowStyle,
        fontFamily: 'sans-serif',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* ── Image area ── only when 'image' is in visibleFields */}
      {show('image') && (
        imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: 100,
              background: 'linear-gradient(135deg, #2a2d45 0%, #1a1c2e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            🃏
          </div>
        )
      )}

      {/* ── Content ── */}
      <div style={{ padding: s.padding }}>

        {/* Badge — only when 'badge' is in visibleFields and badge text exists */}
        {show('badge') && badge && (
          <span
            style={{
              display: 'inline-block',
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 20,
              background: bc.bg,
              color: bc.color,
              border: `1px solid ${bc.border}`,
              marginBottom: 8,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </span>
        )}

        {/* Title — always visible */}
        <div
          style={{
            fontSize: s.titleSize,
            fontWeight: 600,
            color: '#e5e7eb',
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>

        {/* Description — only when 'description' is in visibleFields */}
        {show('description') && description && (
          <div
            style={{
              fontSize: s.descSize,
              color: '#6b7280',
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  )
}