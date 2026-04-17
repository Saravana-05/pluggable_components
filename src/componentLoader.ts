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

export class ComponentLoader {
  registry: Record<string, any> = {}
  meta: Record<string, any> = {}

  async loadComponent(config: any) {
    return unwrap(await import(/* @vite-ignore */ config.entry))
  }

  async load(manifest: any, order: string[]) {
    for (const name of order) {
      const cfg = manifest.components[name]
      if (!cfg) continue
      const resolvedConfig = unwrap(cfg.config) ?? unwrap(cfg)
      if (resolvedConfig?.enabled === false) continue
      const comp = unwrap(cfg.component) ?? await this.loadComponent(resolvedConfig)
      this.registry[name] = comp
      this.meta[name]     = resolvedConfig
    }
  }

  get(name: string) { return this.registry[name] }
  getMeta(name: string) { return this.meta[name] }
  getAllMeta() { return this.meta }
}