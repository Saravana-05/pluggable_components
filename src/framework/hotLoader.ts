import { buildManifest } from './manifestBuilder'
import { buildGraph, detectCycles, topoSort } from './dependencyGraph'
import { ComponentLoader } from '../componentLoader'

export class HotLoader extends ComponentLoader {
  private manifest: any

  constructor(private dir: string) {
    super()
  }

  async init() {
    await this.reload()
  }

  async reload() {
    const manifest = buildManifest()
    this.manifest = manifest

    const graph = buildGraph(manifest)

    if (detectCycles(graph)) {
      throw new Error('Dependency cycle detected')
    }

    const order = topoSort(graph)
    await this.load(manifest, order)
  }

  getManifest() {
    return this.manifest
  }

  // FIX: was reading this.manifest?.components?.[type]?.component
  // but ComponentLoader.load() stores components in this.registry — use this.get()
  getComponent(type: string) {
    return this.get(type)
  }

  // FIX: was reading this.manifest?.components?.[type]?.config
  // but ComponentLoader.load() stores meta in this.meta — use parent getMeta()
  // Override is kept so external callers don't break, but delegates correctly
  getMeta(type: string) {
    return super.getMeta(type)
  }
}
