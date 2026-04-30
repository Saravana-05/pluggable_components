// KanbanBoard/kanban.tsx


import { useState, useCallback, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { useLangStore }   from '../../store/languageStore'
import { loadTranslation } from '../../i18n/loader'

const MODULE = 'kanban'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface KanbanTask {
  id:       string
  title:    string
  status:   string
  priority?: string
  assignedWorkers?: string[]
}

export interface KanbanWorker {
  id:     string
  name:   string
  avatar?: string
}

interface KanbanBoardProps {
  // ── Data via props ────────────────────────────────────────────────────────
  tasks?:        KanbanTask[]
  workers?:      KanbanWorker[]
  workersByTask?: Record<string, string[]>  // taskId → workerIds[]
  tasksByWorker?: Record<string, string[]>  // workerId → taskIds[]

  // ── Columns config ────────────────────────────────────────────────────────
  columns?: {
    status:  string
    labelKey: string   // translation key
    accent:  string
    bg:      string
  }[]

  // ── Labels resolved by withMultiLang ──────────────────────────────────────
  title?:       string
  subtitle?:    string
  filterHint?:  string
  noTasksText?: string
  errorText?:   string

  // ── Callbacks — no API calls inside ──────────────────────────────────────
  onTaskMove?:  (taskId: string, newStatus: string, prevStatus: string) => void
  onTaskClick?: (task: KanbanTask) => void

  // ── Display ───────────────────────────────────────────────────────────────
  accentColor?: 'indigo' | 'green' | 'amber' | 'cyan' | 'red'
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_COLUMNS = [
  { status: 'backlog',     labelKey: 'colBacklog',    accent: '#94a3b8', bg: 'rgba(148,163,184,0.06)' },
  { status: 'todo',        labelKey: 'colTodo',       accent: '#818cf8', bg: 'rgba(99,102,241,0.06)'  },
  { status: 'in_progress', labelKey: 'colInProgress', accent: '#fbbf24', bg: 'rgba(251,191,36,0.06)'  },
  { status: 'review',      labelKey: 'colReview',     accent: '#c084fc', bg: 'rgba(192,132,252,0.06)' },
  { status: 'done',        labelKey: 'colDone',       accent: '#4ade80', bg: 'rgba(74,222,128,0.06)'  },
]

const AVATAR_PALETTE = [
  '#0052CC','#00B8D9','#36B37E','#FF5630',
  '#6554C0','#FF8B00','#0065FF','#57D9A3',
]

const PRIORITY_META: Record<string, { icon: string; color: string }> = {
  critical: { icon: '▲▲', color: '#FF5630' },
  high:     { icon: '▲',  color: '#FF8B00' },
  medium:   { icon: '■',  color: '#0052CC' },
  low:      { icon: '▼',  color: '#36B37E' },
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function avatarColor(id: string) {
  let h = 0
  for (const ch of id) h = ch.charCodeAt(0) + ((h << 5) - h)
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

// ─── WorkerAvatar ──────────────────────────────────────────────────────────────

function WorkerAvatar({
  worker, size = 28, style,
}: {
  worker: KanbanWorker; size?: number; style?: React.CSSProperties
}) {
  const isUrl    = worker.avatar?.startsWith('http') || worker.avatar?.startsWith('/')
  const initials = worker.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
  const base: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%',
    border: '2px solid #1e2130', flexShrink: 0,
    boxSizing: 'border-box', ...style,
  }
  if (isUrl) {
    return <img src={worker.avatar} alt={worker.name} title={worker.name}
      style={{ ...base, objectFit: 'cover', display: 'block' }} />
  }
  return (
    <span title={worker.name} style={{
      ...base,
      background: avatarColor(worker.id),
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.36), fontWeight: 700, color: '#fff',
      letterSpacing: '0.02em', userSelect: 'none',
    }}>
      {initials}
    </span>
  )
}

// ─── CardAvatarStack ───────────────────────────────────────────────────────────

function CardAvatarStack({
  taskId, workersByTask, workers,
}: {
  taskId: string; workersByTask: Record<string, string[]>; workers: KanbanWorker[]
}) {
  const workerIds = workersByTask[taskId] ?? []
  const assigned  = workers.filter(w => workerIds.includes(w.id))
  if (!assigned.length) return null
  const visible  = assigned.slice(0, 3)
  const overflow = assigned.length - 3
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((w, i) => (
        <WorkerAvatar key={w.id} worker={w} size={24}
          style={{ marginLeft: i === 0 ? 0 : -7, zIndex: 3 - i }} />
      ))}
      {overflow > 0 && (
        <div style={{
          marginLeft: -7, width: 24, height: 24, borderRadius: '50%',
          border: '2px solid #1e2130', background: '#2a2d3a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 700, color: '#9ca3af',
        }}>
          +{overflow}
        </div>
      )}
    </div>
  )
}

// ─── FilterAvatarBar ───────────────────────────────────────────────────────────

function FilterAvatarBar({
  workers, selectedId, onSelect,
}: {
  workers: KanbanWorker[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  const MAX      = 8
  const visible  = workers.slice(0, MAX)
  const overflow = workers.length - MAX
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((w, i) => {
        const active     = selectedId === null || selectedId === w.id
        const isSelected = selectedId === w.id
        return (
          <button key={w.id} onClick={() => onSelect(w.id)} title={w.name} style={{
            marginLeft: i === 0 ? 0 : -8,
            zIndex: isSelected ? 20 : visible.length - i,
            opacity: active ? 1 : 0.3,
            transform: isSelected ? 'scale(1.18) translateY(-2px)' : 'scale(1)',
            transition: 'all 0.15s ease',
            padding: 0, border: 'none', background: 'none',
            cursor: 'pointer', borderRadius: '50%', outline: 'none',
          }}>
            <WorkerAvatar worker={w} size={32} style={isSelected ? {
              border: `2.5px solid ${avatarColor(w.id)}`,
              boxShadow: `0 0 0 3px ${avatarColor(w.id)}40`,
            } : {}} />
          </button>
        )
      })}
      {overflow > 0 && (
        <div style={{
          marginLeft: -8, width: 32, height: 32, borderRadius: '50%',
          border: '2px solid #1e2130', background: '#2a2d3a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#9ca3af',
        }}>
          +{overflow}
        </div>
      )}
    </div>
  )
}

// ─── TaskCard ──────────────────────────────────────────────────────────────────

function TaskCardItem({
  task, workers, workersByTask, isUpdating, onClick,
}: {
  task: KanbanTask; workers: KanbanWorker[];
  workersByTask: Record<string, string[]>
  isUpdating: boolean; onClick: () => void
}) {
  const prio = PRIORITY_META[task.priority ?? 'medium'] ?? PRIORITY_META.medium
  return (
    <div onClick={onClick} style={{
      position: 'relative', opacity: isUpdating ? 0.55 : 1,
      background: '#252840', border: '1px solid #2e3148',
      borderRadius: 8, padding: '12px 12px 10px',
      cursor: 'pointer', userSelect: 'none',
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#4C9AFF'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(9,30,66,0.3)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#2e3148'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 500, color: '#e5e7eb', lineHeight: 1.4, marginBottom: 10 }}>
        {task.title}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 9, color: prio.color, fontWeight: 900, lineHeight: 1 }}>
            {prio.icon}
          </span>
          <span style={{ fontSize: 10, color: '#6b7280', fontFamily: 'monospace' }}>
            #{task.id}
          </span>
        </div>
        <CardAvatarStack taskId={task.id} workersByTask={workersByTask} workers={workers} />
      </div>
      {isUpdating && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 8,
          background: 'rgba(30,33,48,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '2px solid #818cf8', borderTopColor: 'transparent',
            animation: 'spin 0.7s linear infinite',
          }} />
        </div>
      )}
    </div>
  )
}

// ─── KanbanBoard ───────────────────────────────────────────────────────────────

export default function KanbanBoard({
  tasks:         tasksProp        = [],
  workers:       workersProp      = [],
  workersByTask: workersByTaskProp = {},
  tasksByWorker: tasksByWorkerProp = {},
  columns:       columnsProp,
  title        = 'Kanban Board',
  subtitle     = 'Drag tasks between columns to update status',
  filterHint   = 'Click a member to filter · Drag to change status',
  noTasksText  = 'No tasks',
  errorText    = 'Failed to load board data.',
  onTaskMove,
  onTaskClick,
  accentColor  = 'indigo',
}: KanbanBoardProps) {

  // ── i18n via languageStore ─────────────────────────────────────────────────
  const { languages, langOrder, translations, addTranslation } = useLangStore()

  useEffect(() => {
    languages.forEach(async (lang) => {
      if (!translations[MODULE]?.[lang]) {
        const data = await loadTranslation(MODULE, lang)
        addTranslation(MODULE, lang, data)
      }
    })
  }, [languages.join(',')])

  const resolve = (key: string): string =>
    langOrder
      .filter(l => languages.includes(l))
      .map(l => translations[MODULE]?.[l]?.[key] || translations[MODULE]?.['en']?.[key] || key)
      .filter(Boolean)
      .join(' / ')

  // ── Local state ────────────────────────────────────────────────────────────
  const [taskList,         setTaskList]         = useState<KanbanTask[]>(tasksProp)
  const [filteredWorkerId, setFilteredWorkerId] = useState<string | null>(null)
  const [updatingId,       setUpdatingId]       = useState<string | null>(null)

  // Sync when props change
  useEffect(() => { setTaskList(tasksProp) }, [tasksProp])

  const columns = columnsProp ?? DEFAULT_COLUMNS

  // ── Drag ───────────────────────────────────────────────────────────────────
  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return

    const newStatus  = destination.droppableId
    const prevStatus = source.droppableId

    // Optimistic update
    setTaskList(prev =>
      prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t)
    )

    setUpdatingId(draggableId)

    // Fire callback — parent decides what to do (save to API etc.)
    try {
      onTaskMove?.(draggableId, newStatus, prevStatus)
    } finally {
      setUpdatingId(null)
    }
  }, [onTaskMove])

  // ── Filter ─────────────────────────────────────────────────────────────────
  const visibleTasks = filteredWorkerId
    ? taskList.filter(t => (tasksByWorkerProp[filteredWorkerId] ?? []).includes(t.id))
    : taskList

  const filteredWorker = workersProp.find(w => w.id === filteredWorkerId) ?? null

  const handleAvatarClick = (id: string) =>
    setFilteredWorkerId(prev => prev === id ? null : id)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        fontFamily: 'sans-serif',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 24, flexShrink: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e5e7eb', margin: 0, marginBottom: 4 }}>
            {title}
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>
            {subtitle}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <FilterAvatarBar
              workers={workersProp}
              selectedId={filteredWorkerId}
              onSelect={handleAvatarClick}
            />
            {filteredWorker && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px 10px 3px 6px', borderRadius: 20,
                background: '#2a2d3a', border: '1px solid #3a3d4a',
              }}>
                <WorkerAvatar worker={filteredWorker} size={18} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#e5e7eb' }}>
                  {filteredWorker.name}
                </span>
                <button
                  onClick={() => setFilteredWorkerId(null)}
                  style={{
                    background: 'none', border: 'none', color: '#6b7280',
                    cursor: 'pointer', fontSize: 12, padding: 0, marginLeft: 2,
                  }}
                >✕</button>
              </div>
            )}
            <p style={{ fontSize: 12, color: '#4b5563', marginLeft: 'auto' }}>
              {filteredWorkerId
                ? `${visibleTasks.length} task(s) for ${filteredWorker?.name}`
                : filterHint}
            </p>
          </div>
        </div>

        {/* Columns */}
        <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div style={{
              display: 'flex', gap: 16, overflowX: 'auto',
              paddingBottom: 16, height: '100%',
            }}>
              {columns.map(col => {
                const colTasks = visibleTasks.filter(t => t.status === col.status)
                const label    = resolve(col.labelKey)
                return (
                  <div key={col.status} style={{
                    flexShrink: 0, width: 280, display: 'flex', flexDirection: 'column',
                  }}>
                    {/* Column header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      marginBottom: 12, padding: '0 4px',
                    }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: col.accent, flexShrink: 0,
                      }} />
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', margin: 0 }}>
                        {label}
                      </h3>
                      <span style={{
                        marginLeft: 'auto', fontSize: 11, color: '#6b7280',
                        background: '#2a2d3a', borderRadius: 20, padding: '1px 8px',
                      }}>
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Droppable area */}
                    <Droppable droppableId={col.status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{
                            flex: 1, minHeight: 200, borderRadius: 12, padding: 8,
                            background: snapshot.isDraggingOver ? col.bg : 'rgba(255,255,255,0.03)',
                            transition: 'background 0.2s',
                            outline: snapshot.isDraggingOver ? `1px solid ${col.accent}44` : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {colTasks.map((task, idx) => (
                              <Draggable key={task.id} draggableId={task.id} index={idx}>
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    style={{
                                      ...prov.draggableProps.style,
                                      transform: snap.isDragging
                                        ? `${prov.draggableProps.style?.transform ?? ''} rotate(1deg) scale(1.02)`
                                        : prov.draggableProps.style?.transform,
                                    }}
                                  >
                                    <TaskCardItem
                                      task={task}
                                      workers={workersProp}
                                      workersByTask={workersByTaskProp}
                                      isUpdating={updatingId === task.id}
                                      onClick={() => onTaskClick?.(task)}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}

                            {colTasks.length === 0 && !snapshot.isDraggingOver && (
                              <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                height: 64, borderRadius: 8,
                                border: '2px dashed rgba(255,255,255,0.08)',
                              }}>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
                                  {noTasksText}
                                </p>
                              </div>
                            )}
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        </div>
      </div>
    </>
  )
}