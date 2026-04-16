export class ComponentLoader {
  registry: Record<string, any> = {}
  meta: Record<string, any> = {}

  async loadComponent(config: any) {
    const mod = await import(/* @vite-ignore */ config.entry)
    return mod.default || mod
  }

  async load(manifest: any, order: string[]) {
    for (const name of order) {
      const cfg = manifest.components[name]
      if (!cfg) continue

      // FIX: manifestBuilder stores { component, config } shape.
      // cfg.enabled doesn't exist — the enabled flag is on cfg.config.enabled.
      // Also, components loaded via eager glob already have .component set directly,
      // so we don't need loadComponent() for those — just register directly.
      if (cfg.config?.enabled === false) continue

      // If the component was already bundled by manifestBuilder (eager glob), use it directly.
      // Otherwise fall back to dynamic import via config.entry.
      const comp = cfg.component ?? await this.loadComponent(cfg.config ?? cfg)

      this.registry[name] = comp
      this.meta[name] = cfg.config ?? cfg
    }
  }

  get(name: string) {
    return this.registry[name]
  }

  getMeta(name: string) {
    return this.meta[name]
  }

  getAllMeta() {
    return this.meta
  }
}
