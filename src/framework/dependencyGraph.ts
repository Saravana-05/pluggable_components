
import type { Dependency } from '../types'

export function normalizeDeps(deps: any[]): Dependency[] {
  return (deps || []).map((d) =>
    typeof d === 'string' ? { name: d } : d
  )
}

export function buildGraph(manifest: any) {
  const graph: Record<string, Dependency[]> = {}

  for (const [name, comp] of Object.entries<any>(
    manifest.components
  )) {
    graph[name] = normalizeDeps(comp.dependencies)
  }

  return graph
}

export function detectCycles(graph: Record<string, Dependency[]>) {
  const visited = new Set()
  const stack = new Set()

  function dfs(n: string): boolean {
    if (stack.has(n)) return true
    if (visited.has(n)) return false

    visited.add(n)
    stack.add(n)

    for (const d of graph[n] || []) {
      if (dfs(d.name)) return true
    }

    stack.delete(n)
    return false
  }

  return Object.keys(graph).some(dfs)
}

export function topoSort(graph: Record<string, Dependency[]>) {
  const visited = new Set()
  const result: string[] = []

  function visit(n: string) {
    if (visited.has(n)) return
    visited.add(n)

    for (const d of graph[n] || []) {
      visit(d.name)
    }

    result.push(n)
  }

  Object.keys(graph).forEach(visit)
  return result
}