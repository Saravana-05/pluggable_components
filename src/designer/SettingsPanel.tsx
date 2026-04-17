import { useState } from 'react'
import { useStore } from '../store/designerStore'

function unwrap(m: any): any {
  if (m == null) return m
  if (typeof m === 'object' && (m as any)[Symbol.toStringTag] === 'Module') {
    const d = m.default
    if (d != null && typeof d === 'object' && (d as any)[Symbol.toStringTag] === 'Module')
      return d.default ?? d
    return d ?? m
  }
  return m
}

const inputBase: React.CSSProperties = {
  width: '100%', background: '#2a2d3a', border: '1px solid #3a3d4a',
  borderRadius: 5, padding: '6px 8px', fontSize: 13, color: '#e5e7eb',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

const KNOWN_LABEL_KEYS = ['label','unit','targetLabel','trendLabel','vsPrev','progress','of'] as const

const LABEL_PLACEHOLDERS: Record<string,string> = {
  label:'e.g. Revenue, வருவாய்', unit:'e.g. USD, %', targetLabel:'e.g. Target',
  trendLabel:'e.g. Healthy', vsPrev:'e.g. vs prev', progress:'e.g. Progress', of:'e.g. of',
}

function isI18nSchema(key: string, schema: any): boolean {
  return key === 'i18n' || schema?.additionalProperties?.type === 'object'
}

const SKIP_KEYS = new Set(['cards','labels','sparkData','activeLocale'])

function I18nEditor({ value, onChange }: {
  value: Record<string,Record<string,string>> | undefined | null
  onChange: (v: Record<string,Record<string,string>>) => void
}) {
  const map = value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0 ? value : { en: {} }
  const langs = Object.keys(map)
  const [activeLang, setActiveLang] = useState(langs[0])
  const [newInput, setNewInput] = useState('')
  const [err, setErr] = useState('')
  const active = langs.includes(activeLang) ? activeLang : langs[0]

  function addLang() {
    const c = newInput.trim().toLowerCase()
    if (!c) { setErr('Enter a code'); return }
    if (map[c]) { setErr(`"${c}" exists`); return }
    if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(c)) { setErr('Use BCP-47: "ta","fr","zh-TW"'); return }
    try { Intl.getCanonicalLocales(c) } catch { setErr(`"${c}" invalid`); return }
    onChange({ ...map, [c]: {} }); setActiveLang(c); setNewInput(''); setErr('')
  }
  function removeLang(l: string) {
    if (langs.length <= 1) return
    const n = { ...map }; delete n[l]; onChange(n)
    if (active === l) setActiveLang(Object.keys(n)[0])
  }
  function setLabel(k: string, v: string) {
    onChange({ ...map, [active]: { ...map[active], [k]: v } })
  }

  const cur = map[active] ?? {}
  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:8 }}>
        {langs.map(l => (
          <div key={l} style={{ display:'flex' }}>
            <button onClick={() => setActiveLang(l)} style={{
              fontSize:11, fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase',
              padding:'3px 8px', borderRadius:'4px 0 0 4px',
              border:`1px solid ${l===active?'#6366f1':'#3a3d4a'}`, borderRight:'none',
              background:l===active?'rgba(99,102,241,.18)':'#2a2d3a',
              color:l===active?'#818cf8':'#9ca3af', cursor:'pointer',
            }}>{l}</button>
            <button onClick={() => removeLang(l)} disabled={langs.length<=1} style={{
              fontSize:13, lineHeight:1, padding:'2px 6px', borderRadius:'0 4px 4px 0',
              border:`1px solid ${l===active?'#6366f1':'#3a3d4a'}`,
              background:l===active?'rgba(99,102,241,.1)':'#2a2d3a',
              color:langs.length<=1?'#3a3d4a':'#6b7280',
              cursor:langs.length<=1?'not-allowed':'pointer',
            }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:4, marginBottom:4 }}>
        <input style={{ ...inputBase, flex:1, fontSize:11, padding:'4px 7px' }}
          placeholder='"ta","fr","ar","hi"' value={newInput}
          onChange={e => { setNewInput(e.target.value); setErr('') }}
          onKeyDown={e => e.key==='Enter' && addLang()} />
        <button onClick={addLang} style={{
          fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:5,
          border:'1px solid #3a3d4a', background:'#2a2d3a', color:'#818cf8', cursor:'pointer',
        }}>+ add</button>
      </div>
      {err && <p style={{ fontSize:11, color:'#f87171', marginBottom:6 }}>{err}</p>}
      <div style={{ borderTop:'1px solid #2a2d3a', marginTop:8, paddingTop:10 }}>
        <p style={{ fontSize:10, letterSpacing:'.06em', textTransform:'uppercase', color:'#6b7280', marginBottom:8 }}>
          labels — {active}
        </p>
        {KNOWN_LABEL_KEYS.map(k => (
          <div key={k} style={{ marginBottom:8 }}>
            <label style={{ display:'block', fontSize:11, color:'#6b7280', marginBottom:3 }}>{k}</label>
            <input style={{ ...inputBase, fontSize:12 }} value={cur[k]??''}
              placeholder={LABEL_PLACEHOLDERS[k]??''} onChange={e => setLabel(k, e.target.value)} />
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, padding:'7px 9px', background:'rgba(99,102,241,.08)', border:'1px solid rgba(99,102,241,.2)', borderRadius:5 }}>
        <p style={{ fontSize:10, color:'#818cf8', lineHeight:1.6, margin:0 }}>
          <strong>onLanguageChange</strong> fires with <code style={{ fontFamily:'monospace', fontSize:10 }}>{'{ prev, next, labels }'}</code>
        </p>
      </div>
    </div>
  )
}

export function SettingsPanel({ loader }: any) {
  const currentPageId = useStore((s: any) => s.currentPageId)
  const page = useStore((s: any) => s.pages.find((p: any) => p.id === s.currentPageId))
  const selected = useStore((s: any) => s.selected)
  const update = useStore((s: any) => s.updateNode)
  const node = page?.nodes.find((n: any) => n.id === selected)
  if (!node) return null
  const meta = unwrap(loader.getMeta(node.type))
  if (!meta) return null
  const properties: Record<string,any> = meta.settings?.schema?.properties ?? {}

  function handleChange(key: string, value: any) {
    update(node.id, { props: { ...node.props, [key]: value } })
  }

  return (
    <div style={{ width:260, minWidth:260, height:'100%', borderLeft:'1px solid #2a2d3a', background:'#1a1c24', padding:12, overflowY:'auto', boxSizing:'border-box', flexShrink:0 }}>
      <p style={{ fontSize:10, letterSpacing:'.08em', textTransform:'uppercase', color:'#6b7280', marginBottom:14 }}>
        {node.type} — props
      </p>
      {Object.entries(properties).map(([key, schema]: any) => {
        if (SKIP_KEYS.has(key)) return null
        return (
          <div key={key} style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, color:'#9ca3af', marginBottom:5, textTransform:'capitalize' }}>{key}</label>
            {isI18nSchema(key, schema) ? (
              <I18nEditor value={node.props[key]} onChange={v => handleChange(key, v)} />
            ) : schema.type === 'boolean' ? (
              <input type="checkbox" checked={node.props[key]??false} onChange={e => handleChange(key, e.target.checked)}
                style={{ width:16, height:16, cursor:'pointer', accentColor:'#6366f1' }} />
            ) : schema.enum ? (
              <select value={node.props[key]??schema.enum[0]} onChange={e => handleChange(key, e.target.value)} style={{ ...inputBase, cursor:'pointer' }}>
                {schema.enum.map((o:string) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : schema.type === 'number' ? (
              <input type="number" style={inputBase} value={node.props[key]??0} onChange={e => handleChange(key, Number(e.target.value))} />
            ) : schema.type === 'string' ? (
              <input style={inputBase} value={node.props[key]??''} onChange={e => handleChange(key, e.target.value)} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}