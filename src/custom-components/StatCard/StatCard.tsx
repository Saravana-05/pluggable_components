import { useMemo } from 'react'

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_PATHS: Record<string, string> = {
  'folder':           'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  'trending-up':      'M3 17l6-6 4 4 8-8M17 7h4v4',
  'trending-down':    'M3 7l6 6 4-4 8 8M17 17h4v-4',
  'warning-triangle': 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  'currency-dollar':  'M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6',
  'wallet':           'M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5m0 0h-6a2 2 0 100 4h6',
  'person-group':     'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  'chart-bar':        'M18 20V10M12 20V4M6 20v-6',
  'chart-pie':        'M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z',
  'clock':            'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v6l4 2',
  'check-circle':     'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  'flag':             'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  'bolt':             'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'star':             'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'activity':         'M22 12h-4l-3 9L9 3l-3 9H2',
  'target':           'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 100 4 2 2 0 000-4z',
  'package':          'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CurrencyConfig {
  symbol: string
  position: 'prefix' | 'suffix'
  compact?: boolean
  decimalPlaces?: number
}

interface StatCardProps {
  label?: string
  value?: number | string
  unit?: string
  trend?: 'auto' | 'up' | 'down' | 'neutral'
  trendValue?: number | string
  trendLabel?: string
  positiveIsGood?: boolean
  target?: number | string | null
  targetLabel?: string
  accentColor?: 'indigo' | 'green' | 'red' | 'amber' | 'cyan'
  size?: 'sm' | 'md' | 'lg'
  locale?: string
  sparkData?: { value: number }[]
  icon?: string
  currency?: CurrencyConfig | null
}

// ─── Locale packs ─────────────────────────────────────────────────────────────
// Each entry provides the 3 strings rendered in the card UI.
// Adding a new language: add a key matching the locale code used in the schema.

const STAT_LOCALES: Record<string, { vsPrev: string; progress: string; of: string }> = {
  en: { vsPrev: 'vs prev',            progress: 'Progress',       of: 'of'  },
  fr: { vsPrev: 'vs préc.',           progress: 'Progression',    of: 'de'  },
  de: { vsPrev: 'vs. Vorper.',        progress: 'Fortschritt',    of: 'von' },
  es: { vsPrev: 'vs anterior',        progress: 'Progreso',       of: 'de'  },
  ja: { vsPrev: '前期比',              progress: '進捗',            of: '/'   },
  ar: { vsPrev: 'مقابل السابق',       progress: 'التقدم',          of: 'من'  },
  zh: { vsPrev: '较上期',              progress: '进度',            of: '/'   },
  hi: { vsPrev: 'बनाम पिछला',         progress: 'प्रगति',           of: '/'   },
  ta: { vsPrev: 'முந்தையதுடன்',       progress: 'முன்னேற்றம்',      of: '/'   },
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

const accent = {
  indigo: { color: '#818cf8', bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.3)'  },
  green:  { color: '#4ade80', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)'   },
  red:    { color: '#f87171', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)'   },
  amber:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)'  },
  cyan:   { color: '#22d3ee', bg: 'rgba(34,211,238,0.15)',  border: 'rgba(34,211,238,0.3)'  },
}

const sizes = {
  sm: { width: 180, padding: 12, valueSize: 22, labelSize: 11, iconSize: 16 },
  md: { width: 220, padding: 16, valueSize: 28, labelSize: 12, iconSize: 18 },
  lg: { width: 270, padding: 20, valueSize: 36, labelSize: 13, iconSize: 22 },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isUnresolvedBinding(v: unknown): boolean {
  return typeof v === 'string' && /^\s*\{\{.+\}\}\s*$/.test(v)
}

function resolveNumber(v: number | string | undefined | null, fallback = 0): number {
  if (v == null) return fallback
  if (isUnresolvedBinding(v)) return fallback
  const n = Number(v)
  return isNaN(n) ? fallback : n
}

function isImageUrl(icon: string): boolean {
  return (
    icon.startsWith('http') ||
    icon.startsWith('data:') ||
    icon.startsWith('/') ||
    icon.startsWith('./') ||
    icon.includes('.')
  )
}

function formatCurrency(value: number, cfg: CurrencyConfig, locale: string): string {
  const { symbol, position, compact = false, decimalPlaces } = cfg

  let formatted: string

  if (compact) {
    const tiers = [
      { threshold: 1e12, suffix: 'T' },
      { threshold: 1e9,  suffix: 'B' },
      { threshold: 1e6,  suffix: 'M' },
      { threshold: 1e3,  suffix: 'K' },
    ]
    const tier = tiers.find((t) => Math.abs(value) >= t.threshold)
    if (tier) {
      const dp = decimalPlaces ?? 1
      const compacted = (value / tier.threshold).toFixed(dp).replace(/\.0+$/, '')
      formatted = `${compacted}${tier.suffix}`
    } else {
      const dp = decimalPlaces ?? 0
      formatted = value.toLocaleString(locale, { maximumFractionDigits: dp })
    }
  } else {
    const dp = decimalPlaces ?? 2
    formatted = value.toLocaleString(locale, {
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    })
  }

  return position === 'prefix' ? `${symbol}${formatted}` : `${formatted}${symbol}`
}

// ─── Icon renderer ────────────────────────────────────────────────────────────

function CardIcon({ icon, size, color }: { icon: string; size: number; color: string }) {
  if (isImageUrl(icon)) {
    return (
      <img
        src={icon}
        alt=""
        width={size}
        height={size}
        style={{ objectFit: 'contain', display: 'block' }}
      />
    )
  }

  const path = ICON_PATHS[icon]
  if (!path) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatCard({
  label          = 'Metric Name',
  value          = 0,
  unit           = '',
  trend          = 'auto',
  trendValue     = 0,
  trendLabel,
  positiveIsGood = true,
  target         = null,
  targetLabel    = 'Target',
  accentColor    = 'indigo',
  size           = 'md',
  locale         = 'en',
  sparkData      = [],
  icon,
  currency,
}: StatCardProps) {

  // ── Resolve bound values ──────────────────────────────────────────────────
  const _value      = resolveNumber(value)
  const _trendValue = resolveNumber(trendValue)
  const _target     = target != null ? resolveNumber(target as number | string) : null

  const isValueBinding      = isUnresolvedBinding(value)
  const isTrendValueBinding = isUnresolvedBinding(trendValue)

  const a   = accent[accentColor] ?? accent.indigo
  const s   = sizes[size]         ?? sizes.md

  // ── Locale resolution ─────────────────────────────────────────────────────
  // Falls back to 'en' for any unrecognised locale code so the UI never breaks.
  const t   = STAT_LOCALES[locale] ?? STAT_LOCALES.en
  const loc = locale || 'en'

  // RTL layout for Arabic
  const isRtl = locale === 'ar'

  // ── Trend direction ───────────────────────────────────────────────────────
  const direction =
    trend === 'auto'
      ? _trendValue > 0 ? 'up' : _trendValue < 0 ? 'down' : 'neutral'
      : trend

  const isGood =
    direction === 'neutral' ? null :
    positiveIsGood          ? direction === 'up'
                            : direction === 'down'

  const trendColor =
    isGood === null ? '#6b7280' :
    isGood          ? '#4ade80' : '#f87171'

  const trendIcon =
    direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→'

  // ── Progress ──────────────────────────────────────────────────────────────
  const progress =
    _target != null && _target > 0
      ? Math.min(100, Math.round((_value / _target) * 100))
      : null

  // ── Formatted value ───────────────────────────────────────────────────────
  const displayValue = useMemo(() => {
    if (isValueBinding) return (value as string).trim()
    if (currency) return formatCurrency(_value, currency, loc)
    return _value.toLocaleString(loc)
  }, [_value, isValueBinding, value, currency, loc])

  // ── Target display ────────────────────────────────────────────────────────
  const displayTarget = useMemo(() => {
    if (_target == null) return null
    if (currency) return formatCurrency(_target, currency, loc)
    return `${_target.toLocaleString(loc)}${unit}`
  }, [_target, currency, loc, unit])

  // ── Trend badge text ──────────────────────────────────────────────────────
  // Uses `t.vsPrev` from the active locale pack so the badge text is translated.
  const trendBadgeText = useMemo(() => {
    if (isTrendValueBinding) return (trendValue as string).trim()
    if (trendLabel) return `${trendIcon} ${Math.abs(_trendValue)} ${trendLabel}`
    if (_trendValue !== 0) return `${trendIcon} ${Math.abs(_trendValue)}% ${t.vsPrev}`
    if (direction !== 'neutral') return trendIcon
    return `${trendIcon}`
  }, [isTrendValueBinding, trendValue, trendLabel, trendIcon, _trendValue, t.vsPrev, direction])

  // ── Sparkline ─────────────────────────────────────────────────────────────
  const sparkPath = useMemo(() => {
    if (!sparkData || sparkData.length < 2) return null
    const vals  = sparkData.map((d) => d.value)
    const min   = Math.min(...vals)
    const max   = Math.max(...vals)
    const range = max - min || 1
    const w     = s.width - s.padding * 2
    const h     = 32
    return vals
      .map((v, i) => {
        const x = (i / (vals.length - 1)) * w
        const y = h - ((v - min) / range) * h
        return `${x},${y}`
      })
      .join(' ')
  }, [sparkData, s])

  const showTrendBadge =
    _trendValue !== 0 || trend !== 'auto' || isTrendValueBinding || !!trendLabel

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        width:        s.width,
        padding:      s.padding,
        background:   '#1e2130',
        border:       `1px solid ${a.border}`,
        borderRadius: 12,
        fontFamily:   'sans-serif',
        boxSizing:    'border-box',
      }}
    >
      {/* ── Top row: icon + trend badge ── */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   10,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width:          s.iconSize + 10,
            height:         s.iconSize + 10,
            borderRadius:   8,
            background:     a.bg,
            border:         `1px solid ${a.border}`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
          }}
        >
          {icon ? (
            <CardIcon icon={icon} size={s.iconSize} color={a.color} />
          ) : (
            <div
              style={{
                width:        6,
                height:       6,
                borderRadius: '50%',
                background:   a.color,
                opacity:      0.5,
              }}
            />
          )}
        </div>

        {/* Trend badge — text comes from the active locale pack */}
        {showTrendBadge && (
          <div
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          3,
              fontSize:     11,
              fontWeight:   600,
              color:        isTrendValueBinding ? '#4b5563' : trendColor,
              background:   isTrendValueBinding ? 'rgba(75,85,99,0.15)' : `${trendColor}22`,
              border:       `1px solid ${isTrendValueBinding ? '#374151' : `${trendColor}44`}`,
              borderRadius: 20,
              padding:      '2px 8px',
              fontStyle:    isTrendValueBinding ? 'italic' : 'normal',
              whiteSpace:   'nowrap',
            }}
          >
            {trendBadgeText}
          </div>
        )}
      </div>

      {/* ── Value ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        <span
          style={{
            fontSize:   s.valueSize,
            fontWeight: 700,
            color:      isValueBinding ? '#4b5563' : '#e5e7eb',
            lineHeight: 1,
            fontStyle:  isValueBinding ? 'italic' : 'normal',
          }}
        >
          {displayValue}
        </span>
        {unit && !currency && (
          <span style={{ fontSize: s.labelSize + 1, color: '#6b7280', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {/* ── Label ── */}
      <div
        style={{
          fontSize:      s.labelSize,
          color:         '#6b7280',
          fontWeight:    500,
          letterSpacing: '0.03em',
          marginBottom:  progress !== null ? 10 : 0,
        }}
      >
        {label}
      </div>

      {/* ── Target sub-label ── */}
      {displayTarget && (
        <div
          style={{
            fontSize:     10,
            color:        '#6b7280',
            marginTop:    2,
            marginBottom: progress !== null ? 8 : 0,
          }}
        >
          {targetLabel}: {displayTarget}
        </div>
      )}

      {/* ── Progress bar — uses t.progress and t.of from active locale ── */}
      {progress !== null && (
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              fontSize:       10,
              color:          '#6b7280',
              marginBottom:   4,
            }}
          >
            <span>{t.progress}</span>
            <span>
              {progress}% {t.of} {displayTarget ?? `${_target?.toLocaleString(loc)}${unit}`}
            </span>
          </div>
          <div
            style={{
              height:       4,
              background:   '#2a2d3a',
              borderRadius: 4,
              overflow:     'hidden',
            }}
          >
            <div
              style={{
                width:        `${progress}%`,
                height:       '100%',
                background:   a.color,
                borderRadius: 4,
                transition:   'width 0.3s',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Sparkline ── */}
      {sparkPath && (
        <svg
          width={s.width - s.padding * 2}
          height={32}
          style={{ display: 'block', marginTop: 4 }}
        >
          <polyline
            points={sparkPath}
            fill="none"
            stroke={a.color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.8}
          />
        </svg>
      )}
    </div>
  )
}