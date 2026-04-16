export type ComponentType = 'local' | 'npm' | 'remote'

export interface Dependency {
  name: string
  version?: string
  optional?: boolean
  type?: 'ui' | 'service' | 'plugin'
}

export interface ComponentConfig {
  name: string
  type: ComponentType
  entry?: string
  enabled: boolean
  version?: string
  dependencies?: (string | Dependency)[]
  ui?: {
    icon?: string
    canvasIcon?: string
  }
  settings?: any
  events?: { name: string; label: string }[]
}

export interface Manifest {
  schemaVersion: string
  components: Record<string, ComponentConfig>
}