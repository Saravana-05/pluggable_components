interface IconXProps {
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  label?: string
}

const sizes = {
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
}

export default function IconX({
  src = '',
  size = 'md',
  color = '',
  label = '',
}: IconXProps) {
  const px = sizes[size] ?? sizes.md

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'sans-serif',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: px + 16,
          height: px + 16,
          borderRadius: 8,
          background: '#22253a',
          border: '1px solid #2e3148',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.background = '#2a2d45'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = '#4a4f72'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.background = '#22253a'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = '#2e3148'
        }}
      >
        {src ? (
          <img
            src={src}
            alt={label || 'icon'}
            style={{
              width: px,
              height: px,
              objectFit: 'contain',
              filter: color ? `drop-shadow(0 0 4px ${color})` : 'none',
            }}
          />
        ) : (
          <span style={{ fontSize: px * 0.75, lineHeight: 1 }}>🧩</span>
        )}
      </div>

      {/* Optional label */}
      {label && (
        <span
          style={{
            fontSize: 11,
            color: '#6b7280',
            whiteSpace: 'nowrap',
            maxWidth: px + 32,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}