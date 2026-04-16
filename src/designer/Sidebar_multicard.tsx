import { useDraggable } from '@dnd-kit/core'

// ─── PresetTile ───────────────────────────────────────────────────────────────
// A single draggable tile representing one preset of a component.
// The draggable id encodes both the component type and preset id so
// onDragEnd can decode them without needing extra context.

interface PresetTileProps {
  componentType: string
  preset: {
    id: string
    label: string
    thumbnail: string
    defaultProps: Record<string, any>
    defaultActions: Record<string, any>
  }
}

function PresetTile({ componentType, preset }: PresetTileProps) {
  // id format:  "preset::<ComponentType>::<presetId>"
  const draggableId = `preset::${componentType}::${preset.id}`

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: draggableId,
    data: { componentType, preset },
  })

  // Small preview of which fields are visible for this preset
  const fields: string[] = preset.defaultProps.visibleFields ?? ['image', 'badge', 'description']
  const fieldLabels: Record<string, string> = {
    image: '🖼 img',
    badge: '🏷 badge',
    description: '📝 desc',
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={`Drag to canvas — ${preset.label}`}
      style={{
        padding: '10px 12px',
        marginBottom: 8,
        background: isDragging ? '#252840' : '#1a1c2e',
        border: '1px solid #2e3148',
        borderRadius: 10,
        cursor: 'grab',
        opacity: isDragging ? 0.45 : 1,
        transition: 'background 0.15s, opacity 0.15s',
        userSelect: 'none',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{preset.thumbnail}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#e5e7eb' }}>
            {preset.label}
          </div>
          <div style={{ fontSize: 11, color: '#4b5563' }}>{componentType}</div>
        </div>
      </div>

      {/* Field pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Title is always shown */}
        <FieldPill label="🔤 title" active />
        {fields.map((f) => (
          <FieldPill key={f} label={fieldLabels[f] ?? f} active />
        ))}
      </div>
    </div>
  )
}

// Tiny coloured chip showing which fields are included
function FieldPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: 20,
        background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
        color: active ? '#818cf8' : '#374151',
        border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : '#2e3148'}`,
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  )
}

// ─── ComponentSidebar ─────────────────────────────────────────────────────────
// Renders all registered components and their presets.
// `loader.getAllMeta()` should return an array of component.json objects.

interface ComponentSidebarProps {
  loader: {
    getAllMeta: () => Array<{
      name: string
      category?: string
      presets?: PresetTileProps['preset'][]
    }>
  }
}

export function ComponentSidebar({ loader }: ComponentSidebarProps) {
  // getAllMeta() may return an object/map instead of an array depending on your
  // loader implementation — normalise it to an array before use.
  const raw = loader.getAllMeta()
  const allMeta: Array<{ name: string; category?: string; presets?: PresetTileProps['preset'][] }> =
    Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object'
      ? Object.values(raw)   // loader returns { CardX: meta, ButtonX: meta, … }
      : []

  // Group components by category
  const grouped = allMeta.reduce<Record<string, typeof allMeta>>((acc, meta) => {
    const cat = meta.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(meta)
    return acc
  }, {})

  return (
    <div
      style={{
        width: 220,
        height: '100%',
        overflowY: 'auto',
        borderRight: '1px solid #1e2130',
        background: '#13141f',
        padding: '12px 10px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#4b5563',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 14,
          paddingLeft: 2,
        }}
      >
        Components
      </div>

      {Object.entries(grouped).map(([category, components]) => (
        <div key={category} style={{ marginBottom: 20 }}>
          {/* Category label */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#374151',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 8,
              paddingLeft: 2,
            }}
          >
            {category}
          </div>

          {/* Preset tiles */}
          {components.map((meta) =>
            meta.presets?.map((preset) => (
              <PresetTile
                key={`${meta.name}-${preset.id}`}
                componentType={meta.name}
                preset={preset}
              />
            )) ?? null
          )}
        </div>
      ))}
    </div>
  )
}