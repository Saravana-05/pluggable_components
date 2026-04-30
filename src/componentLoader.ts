import { withMultiLang } from './components/withMultiLang'

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

      if (cfg.config?.enabled === false) continue

      // If the component was already bundled by manifestBuilder (eager glob), use it directly.
      // Otherwise fall back to dynamic import via config.entry.
      let comp = cfg.component ?? await this.loadComponent(cfg.config ?? cfg)

      // If component.json has a multiLang section, wrap automatically.
      // No changes needed to the component itself.
      if (cfg.config?.multiLang) {
        comp = withMultiLang(comp, cfg.config.multiLang.module, cfg.config.multiLang.propMap)
      }

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