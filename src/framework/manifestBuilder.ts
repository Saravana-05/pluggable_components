export function buildManifest() {
  // Grab every .tsx file under custom-components (not just index.tsx)
  const modules = import.meta.glob('../custom-components/**/*.tsx', { eager: true })
  const configs = import.meta.glob('../custom-components/**/component.json', { eager: true })

  const components: any = {}

  Object.entries(configs).forEach(([configPath, config]: any) => {
    // configPath = '../custom-components/CardX/component.json'
    const dir = configPath.replace('/component.json', '')
    // e.g. '../custom-components/CardX'

    // component.json can be a single object OR a name-keyed map
    // Normalise to an array of component config entries
    const entries: any[] = Array.isArray(config)
      ? config
      : config && typeof config === 'object' && !('name' in config)
        ? Object.values(config)   // { CardX: {...}, StatCard: {...} }
        : config
          ? [config]              // single { name, entry, ... }
          : []

    for (const cfg of entries) {
      if (!cfg?.name) {
        console.warn(`[manifestBuilder] component.json entry missing 'name' in: ${configPath}`)
        continue
      }
      if (cfg.enabled === false) continue

      // Resolve the entry file.
      // cfg.entry is relative to the component folder, e.g. "./index.tsx" or "./StatCard.tsx"
      const entryFile = (cfg.entry ?? './index.tsx').replace(/^\.\//, '')
      const modulePath = `${dir}/${entryFile}`

      const mod: any = modules[modulePath]

      if (!mod) {
        console.warn(
          `[manifestBuilder] No module found for '${cfg.name}' at: ${modulePath}\n` +
          `  Available keys: ${Object.keys(modules).filter(k => k.startsWith(dir)).join(', ')}`
        )
        continue
      }

      components[cfg.name] = {
        component: mod.default ?? mod,
        config: cfg,
      }
    }
  })

  return {
    schemaVersion: '1.0',
    components,
  }
}