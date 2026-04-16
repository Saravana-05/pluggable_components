import { useState } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonXProps {
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
}

const styles: Record<string, React.CSSProperties> = {
  // Base button — all shared styles
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.01em',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    outline: 'none',
    transition: 'transform 80ms ease, box-shadow 150ms ease, background-color 150ms ease, opacity 150ms ease',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },

  // Sizes
  sm: { fontSize: 12, padding: '6px 14px', borderRadius: 6 },
  md: { fontSize: 14, padding: '9px 20px', borderRadius: 8 },
  lg: { fontSize: 16, padding: '12px 28px', borderRadius: 10 },

  // Variants (idle state)
  primary: {
    backgroundColor: '#010101',
    color: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4), 0 0 0 0px rgba(99,102,241,0.3)',
  },
  secondary: {
    backgroundColor: '#1e2028',
    color: '#e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 1px #3a3d4a',
  },
  danger: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    boxShadow: '0 1px 3px rgba(220,38,38,0.4)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#a5b4fc',
    boxShadow: 'inset 0 0 0 1px #3a3d4a',
  },

  // Hover states
  primaryHover: {
    backgroundColor: '#4f46e5',
    boxShadow: '0 4px 12px rgba(99,102,241,0.45), 0 0 0 3px rgba(99,102,241,0.15)',
  },
  secondaryHover: {
    backgroundColor: '#2a2d3a',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 0 0 1px #6366f1',
  },
  dangerHover: {
    backgroundColor: '#b91c1c',
    boxShadow: '0 4px 12px rgba(220,38,38,0.45)',
  },
  ghostHover: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    boxShadow: 'inset 0 0 0 1px #6366f1',
  },

  // Active (pressed) — subtle scale down
  active: {
    transform: 'scale(0.97)',
  },

  disabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    transform: 'none',
  },
}

export default function ButtonX({
  label = 'Click',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
}: ButtonXProps) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const hoverStyle = hovered && !disabled ? styles[`${variant}Hover`] : {}
  const activeStyle = pressed && !disabled ? styles.active : {}
  const disabledStyle = disabled ? styles.disabled : {}

  return (
    <button
      style={{
        ...styles.base,
        ...styles[size],
        ...styles[variant],
        ...(fullWidth ? { width: '100%' } : {}),
        ...hoverStyle,
        ...activeStyle,
        ...disabledStyle,
      }}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {label}
    </button>
  )
}
