// GanttChart.tsx — pluggable component
// All data comes via props. No API calls.
// Drop into your loader the same way as StatCard.

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Gantt, Willow } from "@svar-ui/react-gantt";
import { useI18n } from "../../hooks/useI18n";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface GanttTask {
  id: number
  text: string
  start: Date | string
  end: Date | string
  progress?: number
  color?: string
  status?: string
  type?: "task" | "summary"
  parent?: number
  open?: boolean
}

export interface GanttLink {
  id: string
  source: number
  target: number
  type?: number
}

interface GanttChartProps {
  // ── Data via props (no API) ────────────────────────────────────────────────
  projects?: {
    id: number | string
    name: string
    status?: string
    start_date?: string
    end_date?: string
  }[]
  tasks?: {
    id: number | string
    title?: string
    name?: string
    project_id?: number | string
    status?: string
    start_date?: string
    start?: string
    end_date?: string
    end?: string
  }[]
  links?: GanttLink[]

  // ── Callbacks — fired on user interactions ─────────────────────────────────
  onTaskUpdate?:  (taskId: number, start: string, end: string) => void
  onLinkAdd?:     (source: number, target: number) => void
  onLinkRemove?:  (source: number, target: number) => void
  onTaskClick?:   (task: GanttTask) => void

  // ── Display ───────────────────────────────────────────────────────────────
  theme?:            "light" | "dark"
  defaultZoom?:      "week" | "month" | "quarter"
  showStats?:        boolean
  showToolbar?:      boolean
  showDependencies?: boolean
  width?: number
  height?: number

  // ── i18n ──────────────────────────────────────────────────────────────────
  i18n?: Record<string, Record<string, string>>
  activeLocale?: string
  onLanguageChange?: (evt: { prev: string; next: string; labels: Record<string, string> }) => void
}

// ─── English fallback labels ────────────────────────────────────────────────────

const FALLBACK: Record<string, string> = {
  title:        "Project Timeline",
  subtitle:     "Click a project to zoom in · Drag tasks to reschedule",
  projects:     "Projects",
  tasks:        "Tasks",
  done:         "Done",
  overdue:      "Overdue",
  dependencies: "Dependencies",
  week:         "Week",
  month:        "Month",
  quarter:      "Quarter",
  refresh:      "Refresh",
  loading:      "Loading…",
  noData:       "No projects or tasks found.",
  back:         "Back to",
  view:         "view",
  noLink:       "Cannot link project summary rows",
  circular:     "Circular dependency — link not saved",
}

// ─── Utility helpers ────────────────────────────────────────────────────────────

function toISODate(d: any): string {
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`
}

const quarterFormat = (date: any) => {
  const d = new Date(date)
  return `Q${Math.floor(d.getMonth()/3)+1} ${d.getFullYear()}`
}

const SCALE_PRESETS: Record<string, any[]> = {
  week: [
    { unit:"month",   step:1, format:"%F %Y" },
    { unit:"week",    step:1, format:"Week %W" },
    { unit:"day",     step:1, format:"%j" },
  ],
  month: [
    { unit:"quarter", step:1, format:quarterFormat },
    { unit:"month",   step:1, format:"%F %Y" },
  ],
  quarter: [
    { unit:"year",    step:1, format:"%Y" },
    { unit:"quarter", step:1, format:quarterFormat },
  ],
}

function statusToColor(status = "") {
  const map: Record<string, string> = {
    done:"#10b981", completed:"#10b981",
    "in-progress":"#3b82f6", in_progress:"#3b82f6", active:"#3b82f6",
    pending:"#94a3b8", todo:"#94a3b8", blocked:"#ef4444",
  }
  return map[(status??"").toLowerCase()] ?? "#3b82f6"
}

function statusToProgress(status = "") {
  const map: Record<string, number> = {
    done:100, completed:100,
    "in-progress":50, in_progress:50, active:50,
    pending:0, todo:0, blocked:0,
  }
  return map[(status??"").toLowerCase()] ?? 0
}

function safeDate(raw: any, fallback = new Date()) {
  if (!raw) return fallback
  const d = new Date(raw)
  return isNaN(d.getTime()) ? fallback : d
}

function daysBetween(a: Date, b: Date) {
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000)
  return Number.isFinite(diff) && diff > 0 ? diff : 1
}

const PROJECT_ID_OFFSET = 1_000_000_000
const projectRowId = (id: number) => PROJECT_ID_OFFSET + Number(id)
const rawProjectId  = (id: number) => id - PROJECT_ID_OFFSET
const isProjectRow  = (id: number) => id >= PROJECT_ID_OFFSET

// ── Build gantt rows from projects + tasks props ───────────────────────────────
function buildGanttRows(projects: GanttChartProps["projects"] = [], apiTasks: GanttChartProps["tasks"] = []) {
  const validProjectIds = new Set(projects.map((p) => Number(p.id)))
  const rows: any[] = []

  for (const p of projects) {
    const numId  = Number(p.id)
    const pRowId = projectRowId(numId)

    const children = apiTasks
      .filter((t) => Number(t.project_id) === numId)
      .map((t) => {
        const start = safeDate(t.start_date ?? t.start)
        const end   = safeDate(t.end_date ?? t.end, new Date(start.getTime() + 7*86_400_000))
        return {
          id: Number(t.id),
          text: String(t.title ?? t.name ?? `Task ${t.id}`),
          start, end,
          duration: daysBetween(start, end),
          progress: statusToProgress(t.status),
          color: statusToColor(t.status),
          status: t.status ?? "pending",
          type: "task",
          parent: pRowId,
        }
      })

    const hasChildren = children.length > 0
    let pStart = p.start_date ? safeDate(p.start_date) : null
    let pEnd   = p.end_date   ? safeDate(p.end_date)   : null
    if (!pStart && hasChildren) pStart = new Date(Math.min(...children.map((c) => c.start.getTime())))
    if (!pEnd   && hasChildren) pEnd   = new Date(Math.max(...children.map((c) => c.end.getTime())))
    pStart = pStart ?? new Date()
    pEnd   = pEnd   ?? new Date(pStart.getTime() + 30*86_400_000)

    const avgProgress = hasChildren
      ? Math.round(children.reduce((s, c) => s + (c.progress ?? 0), 0) / children.length)
      : 0

    rows.push({
      id: pRowId,
      text: String(p.name),
      start: pStart, end: pEnd,
      duration: daysBetween(pStart, pEnd),
      progress: avgProgress,
      color: statusToColor(p.status),
      status: p.status ?? "pending",
      type: "summary",
      parent: 0,
      open: hasChildren,
    })
    rows.push(...children)
  }

  // Tasks with no project
  for (const t of apiTasks) {
    if (t.project_id != null && validProjectIds.has(Number(t.project_id))) continue
    const start = safeDate(t.start_date ?? t.start)
    const end   = safeDate(t.end_date ?? t.end, new Date(start.getTime() + 7*86_400_000))
    rows.push({
      id: Number(t.id),
      text: String(t.title ?? t.name ?? `Task ${t.id}`),
      start, end,
      duration: daysBetween(start, end),
      progress: statusToProgress(t.status),
      color: statusToColor(t.status),
      status: t.status ?? "pending",
      type: "task",
      parent: 0,
    })
  }

  return rows
}

function wouldCreateCycle(adjacency: Map<number,number[]>, src: number, tgt: number) {
  const visited = new Set<number>()
  const stack = [tgt]
  while (stack.length) {
    const node = stack.pop()!
    if (node === src) return true
    if (visited.has(node)) continue
    visited.add(node)
    for (const n of adjacency.get(node) ?? []) stack.push(n)
  }
  return false
}

function buildAdjacency(links: GanttLink[]) {
  const map = new Map<number, number[]>()
  for (const l of links) {
    if (!map.has(l.source)) map.set(l.source, [])
    map.get(l.source)!.push(l.target)
  }
  return map
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <>
      <style>{`@keyframes _gspin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:36, height:36, border:"3px solid #e2e8f0",
        borderTopColor:"#3b82f6", borderRadius:"50%", animation:"_gspin 0.8s linear infinite" }} />
    </>
  )
}

function Toast({ message, type }: { message: string|null; type: string }) {
  if (!message) return null
  return (
    <div style={{
      position:"absolute", bottom:16, right:16, zIndex:50,
      background: type==="error" ? "#fef2f2" : "#f0fdf4",
      border: `1px solid ${type==="error" ? "#fecaca" : "#bbf7d0"}`,
      color: type==="error" ? "#dc2626" : "#16a34a",
      borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600,
      boxShadow:"0 2px 8px rgba(0,0,0,0.10)",
      display:"flex", alignItems:"center", gap:8, pointerEvents:"none",
    }}>
      {type==="error" ? "⚠️" : "✓"} {message}
    </div>
  )
}

const LANG_META: Record<string, { flag: string; native: string }> = {
  en:{flag:"🇬🇧",native:"English"}, ta:{flag:"🇮🇳",native:"தமிழ்"},
  ar:{flag:"🇸🇦",native:"عربي"},    hi:{flag:"🇮🇳",native:"हिंदी"},
  fr:{flag:"🇫🇷",native:"Français"},de:{flag:"🇩🇪",native:"Deutsch"},
  es:{flag:"🇪🇸",native:"Español"}, zh:{flag:"🇨🇳",native:"中文"},
}

const columns = [{ id:"text", header:"Task Name", width:200, flexgrow:1 }]

// ─── Main component ─────────────────────────────────────────────────────────────

export default function GanttChart({
  // data
  projects = [],
  tasks = [],
  links: linksProp = [],
  // callbacks
  onTaskUpdate,
  onLinkAdd,
  onLinkRemove,
  onTaskClick,
  // display
  theme: themeProp = "light",
  defaultZoom = "month",
  showStats = true,
  showToolbar = true,
  showDependencies = true,
  width = 860,
  height = 500,
  // i18n
  i18n,
  activeLocale: controlledLocale,
  onLanguageChange,
}: GanttChartProps) {

  // ── i18n ───────────────────────────────────────────────────────────────────
  const { t, activeLocale, langs, switchLang, isRtl } = useI18n({
    i18n, activeLocale: controlledLocale, onLanguageChange, fallback: FALLBACK,
  })

  // ── Build rows from props ──────────────────────────────────────────────────
  const [ganttTasks, setGanttTasks] = useState<any[]>(() => buildGanttRows(projects, tasks))
  const [ganttLinks, setGanttLinks] = useState<GanttLink[]>(linksProp)
  const [zoom,  setZoom]  = useState(defaultZoom)
  const [theme, setTheme] = useState(themeProp)
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)
  const [drilledProject, setDrilledProject] = useState<any>(null)
  const prevZoomRef = useRef(defaultZoom)
  const apiRef      = useRef<any>(null)
  const toastTimer  = useRef<any>(null)

  // Re-build rows when props change
  useEffect(() => {
    setGanttTasks(buildGanttRows(projects, tasks))
  }, [projects, tasks])

  useEffect(() => { setGanttLinks(linksProp) }, [linksProp])
  useEffect(() => { setTheme(themeProp) }, [themeProp])

  const showToast = useCallback((msg: string, type = "success") => {
    setToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  // ── Drill-down ─────────────────────────────────────────────────────────────
  const handleDrillDown = useCallback((clicked: any, api: any) => {
    prevZoomRef.current = zoom
    setDrilledProject(clicked)
    setZoom("week")
    setTimeout(() => { try { api.exec("scroll-chart", { date: clicked.start }) } catch(_){} }, 150)
  }, [zoom])

  // ── Gantt events ────────────────────────────────────────────────────────────
  const handleApiReady = useCallback((api: any) => {
    apiRef.current?.detach?.()
    apiRef.current = api

    // Click project → drill down
    api.on("select-task", (ev: any) => {
      setGanttTasks((cur) => {
        const clicked = cur.find((r) => r.id === ev.id)
        if (clicked?.type === "summary") handleDrillDown(clicked, api)
        onTaskClick?.(clicked)
        return cur
      })
    })

    // Drag / resize → call onTaskUpdate prop (no API)
    api.on("update-task", (ev: any) => {
      const updated = ev.task ?? ev
      setGanttTasks((prev) => prev.map((r) => r.id === updated.id ? { ...r, ...updated } : r))
      const start = toISODate(updated.start)
      const end   = toISODate(updated.end)
      if (isProjectRow(updated.id)) {
        onTaskUpdate?.(rawProjectId(updated.id), start, end)
      } else {
        onTaskUpdate?.(updated.id, start, end)
      }
      showToast("Saved ✓")
    })

    // Draw arrow → call onLinkAdd prop (no API)
    api.on("add-link", (ev: any) => {
      const { source, target, type = 0 } = ev.link ?? ev
      if (isProjectRow(source) || isProjectRow(target)) {
        showToast(t("noLink"), "error"); return
      }
      setGanttLinks((prev) => {
        const adj = buildAdjacency(prev)
        if (wouldCreateCycle(adj, Number(source), Number(target))) {
          showToast(t("circular"), "error"); return prev
        }
        const newLink: GanttLink = { id:`${source}-${target}`, source:Number(source), target:Number(target), type }
        if (prev.some((l) => l.id === newLink.id)) return prev
        onLinkAdd?.(Number(source), Number(target))
        return [...prev, newLink]
      })
    })

    // Delete arrow → call onLinkRemove prop (no API)
    api.on("delete-link", (ev: any) => {
      const linkId = ev.id ?? ev.link?.id
      setGanttLinks((prev) => {
        const found = prev.find((l) => l.id === linkId)
        if (!found) return prev
        onLinkRemove?.(found.source, found.target)
        return prev.filter((l) => l.id !== linkId)
      })
    })
  }, [handleDrillDown, showToast, t, onTaskUpdate, onLinkAdd, onLinkRemove, onTaskClick])

  // ── Derived stats ───────────────────────────────────────────────────────────
  const projectRows  = ganttTasks.filter((r) => r.type === "summary")
  const leafTasks    = ganttTasks.filter((r) => r.type === "task")
  const doneTasks    = leafTasks.filter((t) => ["done","completed"].includes((t.status??"").toLowerCase())).length
  const overdueTasks = leafTasks.filter((t) => {
    const incomplete = !["done","completed"].includes((t.status??"").toLowerCase())
    return incomplete && t.end && new Date(t.end) < new Date()
  }).length

  // ── Theme ───────────────────────────────────────────────────────────────────
  const isDark    = theme === "dark"
  const surface   = isDark ? "#1e2433" : "#fff"
  const border    = isDark ? "#2d3748" : "#e2e8f0"
  const textMuted = isDark ? "#e2e8f0" : "#374151"

  const loadKey    = ganttTasks.map((r) => r.id).join(",") || "empty"
  const ganttReady = ganttTasks.length > 0

  // ── Responsive font scaling ──────────────────────────────────────────────────
  // At base width=860 scale=1. Clamp between 0.45 and 1.4.
  const scale = Math.min(Math.max(width / 860, 0.45), 1.4)
  const fs = (base: number) => Math.round(base * scale)
  const sp = (base: number) => Math.round(base * scale)

  // Stable scope id so the injected <style> only targets THIS instance
  const scopeId = useMemo(() => `gc-${Math.random().toString(36).slice(2,7)}`, [])

  // Inject CSS overriding SVAR Gantt's internal font sizes proportionally
  const ganttFontSize = Math.round(9 * scale)
  const ganttRowH     = Math.round(32 * scale)
  const ganttScaleH   = Math.round(28 * scale)
  const ganttScaleCss = `
    #${scopeId} .wx-gantt .wx-scale-cell,
    #${scopeId} .wx-gantt .wx-cell,
    #${scopeId} .wx-gantt .wx-bar-label,
    #${scopeId} .wx-gantt [class*="scale"],
    #${scopeId} .wx-gantt [class*="header"],
    #${scopeId} .wx-gantt [class*="cell"],
    #${scopeId} .wx-gantt [class*="label"],
    #${scopeId} .wx-tree-table [class*="cell"],
    #${scopeId} .wx-tree-table [class*="header"] {
      font-size: ${ganttFontSize}px !important;
      line-height: normal !important;
    }
    #${scopeId} .wx-gantt .wx-bar,
    #${scopeId} .wx-gantt .wx-bar *,
    #${scopeId} .wx-gantt [class*="bar"],
    #${scopeId} .wx-gantt [class*="bar"] * {
      font-size: ${ganttFontSize}px !important;
    }
    #${scopeId} .wx-gantt *,
    #${scopeId} .wx-tree-table * {
      font-size: ${ganttFontSize}px !important;
    }
    #${scopeId} .wx-gantt .wx-scale-row { height: ${ganttScaleH}px !important; }
    #${scopeId} .wx-gantt .wx-row       { height: ${ganttRowH}px !important; }
  `

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div id={scopeId} style={{ width, height, overflow:"hidden", position:"relative", boxSizing:"border-box" }}>
    <style>{ganttScaleCss}</style>
    <div dir={isRtl ? "rtl" : "ltr"} style={{
      fontFamily:"'Inter',system-ui,sans-serif",
      background: isDark ? "#0f1117" : "#f4f6f9",
      color: isDark ? "#e2e8f0" : "#1a202c",
      padding: sp(20),
      boxSizing:"border-box",
      width, height,
      overflow:"hidden",
      display:"flex", flexDirection:"column", gap: sp(8),
    }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
        flexWrap:"wrap", gap: sp(8), flexShrink:0 }}>
        <div>
          <h1 style={{ margin:0, fontSize:fs(20), fontWeight:700, lineHeight:1.2 }}>📋 {t("title")}</h1>
          {width > 400 && (
            <p style={{ margin:`${sp(3)}px 0 0`, fontSize:fs(11), opacity:0.6 }}>{t("subtitle")}</p>
          )}
        </div>

        {/* Stats */}
        {showStats && (
          <div style={{ display:"flex", gap: sp(6), flexWrap:"wrap" }}>
            {[
              { key:"projects",     value:projectRows.length,  color:"#8b5cf6" },
              { key:"tasks",        value:leafTasks.length,    color:"#3b82f6" },
              { key:"done",         value:doneTasks,           color:"#10b981" },
              { key:"overdue",      value:overdueTasks,        color:"#ef4444" },
              ...(showDependencies ? [{ key:"dependencies", value:ganttLinks.length, color:"#f59e0b" }] : []),
            ].map(({ key, value, color }) => (
              <div key={key} style={{ background:surface, border:`1px solid ${border}`,
                borderRadius: sp(6), padding:`${sp(3)}px ${sp(8)}px`, fontSize:fs(9),
                display:"flex", alignItems:"center", gap: sp(3) }}>
                <span style={{ fontWeight:700, color, fontSize:fs(9) }}>{value}</span>
                <span style={{ opacity:0.6, fontSize:fs(9) }}>{t(key)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      {showToolbar && (
        <div style={{ display:"flex", gap: sp(6), flexWrap:"wrap", alignItems:"center", flexShrink:0 }}>
          {/* Zoom */}
          {(["week","month","quarter"] as const).map((level) => (
            <button key={level} onClick={() => { setZoom(level); if (drilledProject) setDrilledProject(null) }}
              style={{ padding:`${sp(4)}px ${sp(10)}px`, borderRadius: sp(5), cursor:"pointer", fontSize:fs(12),
                fontWeight: zoom===level ? 700 : 400,
                background: zoom===level ? "#3b82f6" : surface,
                color: zoom===level ? "#fff" : textMuted,
                border: `1px solid ${zoom===level ? "#3b82f6" : border}`,
                transition:"all 0.15s" }}>
              {t(level)}
            </button>
          ))}

          {/* Theme toggle */}
          <button onClick={() => setTheme((th) => th==="light" ? "dark" : "light")}
            style={{ padding:`${sp(4)}px ${sp(10)}px`, borderRadius: sp(5), fontSize:fs(12),
              border:`1px solid ${border}`, background:surface, color:textMuted, cursor:"pointer" }}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Back from drill-down */}
          {drilledProject && (
            <button onClick={() => { setZoom(prevZoomRef.current); setDrilledProject(null) }}
              style={{ padding:`${sp(4)}px ${sp(10)}px`, borderRadius: sp(5), fontSize:fs(12),
                border:"1px solid #8b5cf6", background:"#8b5cf6",
                color:"#fff", cursor:"pointer", fontWeight:600,
                display:"flex", alignItems:"center", gap: sp(4) }}>
              ← {t("back")} {t(prevZoomRef.current)} {t("view")}
            </button>
          )}

          {/* Language selector */}
          {langs.length > 1 && (
            <div style={{ marginLeft:"auto", display:"flex", gap: sp(4) }}>
              {langs.map((lang) => {
                const meta = LANG_META[lang]
                const isActive = lang === activeLocale
                return (
                  <button key={lang} onClick={() => switchLang(lang)} style={{
                    display:"inline-flex", alignItems:"center", gap: sp(3),
                    fontSize:fs(10), fontWeight:isActive ? 600 : 400,
                    padding:`${sp(3)}px ${sp(7)}px`, borderRadius: sp(16),
                    border:`1px solid ${isActive ? "#6366f1" : "rgba(255,255,255,0.15)"}`,
                    background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                    color: isActive ? "#818cf8" : textMuted,
                    cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit",
                  }}>
                    {meta && <span style={{fontSize:fs(11)}}>{meta.flag}</span>}
                    <span>{isActive && meta ? meta.native : lang.toUpperCase()}</span>
                    {isActive && <span style={{fontSize:fs(9),opacity:0.8}}>✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {ganttTasks.length === 0 && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
          justifyContent:"center", gap: sp(8), opacity:0.5, flex:1 }}>
          <span style={{ fontSize:fs(28) }}>📭</span>
          <p style={{ fontSize:fs(13), margin:0 }}>{t("noData")}</p>
        </div>
      )}

      {/* ── Gantt — flex:1 so it fills ALL remaining height exactly ── */}
      {ganttReady && (
        <div style={{ borderRadius: sp(10), border:`1px solid ${border}`,
          boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.06)",
          flex:1, minHeight:0, position:"relative", background:surface, overflow:"hidden" }}>
          <Willow theme={isDark ? "dark" : undefined}>
            <Gantt
              key={loadKey}
              tasks={ganttTasks}
              links={ganttLinks}
              scales={SCALE_PRESETS[zoom]}
              columns={columns}
              readonly={false}
              init={handleApiReady}
              zoom={true}
            />
          </Willow>
          <Toast message={toast?.msg ?? null} type={toast?.type ?? "success"} />
        </div>
      )}
    </div>
    </div>
  )
}