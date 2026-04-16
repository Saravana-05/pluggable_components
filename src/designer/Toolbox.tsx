import { useDraggable } from '@dnd-kit/core'

export function Toolbox({ loader }: any) {
  const meta = loader.getAllMeta()
  const entries = Object.entries(meta)

  if (entries.length === 0) return null

  return (
    <div style={{ marginTop: 16 }}>
      <p
        style={{
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4b5270',
          marginBottom: 8,
          paddingLeft: 4,
          fontWeight: 600,
        }}
      >
        Icons
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {entries.map(([name, m]: any) => (
          <Item key={name} name={name} meta={m} />
        ))}
      </div>
    </div>
  )
}

function Item({ name, meta }: any) {
  const { listeners, attributes, setNodeRef, isDragging } = useDraggable({
    id: name,
    data: { type: name },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.4 : 1,
        padding: '8px 12px',
        marginBottom: 4,
        background: '#22253a',
        border: '1px solid #2e3148',
        borderRadius: 8,
        cursor: 'grab',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
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
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: '#1a1c2e',
          border: '1px solid #2e3148',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {meta.ui?.icon ? (
          <img
            src={meta.ui.icon}
            alt={name}
            style={{ width: 18, height: 18, objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: 16 }}>🧩</span>
        )}
      </div>

      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#d4d8e8',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </span>
    </div>
  )
}