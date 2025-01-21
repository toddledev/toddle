import type {
  Component,
  RouteDeclaration,
} from '@toddledev/core/dist/component/component.types'
import type { Formula } from '@toddledev/core/dist/formula/formula'
import type { PluginFormula } from '@toddledev/core/dist/formula/formulaTypes'
import type { OldTheme, Theme } from '@toddledev/core/dist/styling/theme'

export interface ToddleProject {
  name: string
  description?: string | null
  short_id: string
  id: string
  emoji?: string | null
  type: 'app' | 'package'
  thumbnail?: { path: string } | null
}

export interface ProjectFiles {
  // Partial to make sure we check for the existence of a Component
  components: Partial<Record<string, Component>>
  packages?: Record<string, InstalledPackage>
  actions?: Record<string, PluginAction>
  formulas?: Record<string, PluginFormula<string>>
  routes?: Record<string, Route>
  config?: {
    theme: OldTheme
    meta?: {
      icon?: { formula: Formula }
      robots?: { formula: Formula }
      sitemap?: { formula: Formula }
      manifest?: { formula: Formula }
      serviceWorker?: { formula: Formula }
    }
  }
  themes?: Record<string, Theme>
}

export type InstalledPackage = Pick<
  ProjectFiles,
  // we might want to add themes + config later
  'components' | 'actions' | 'formulas'
> & {
  manifest: {
    name: string
    // commit represents the commit hash (version) of the package
    commit: string
  }
}

export interface PluginAction {
  name: string
  description?: string
  version?: 2 | never
  arguments: Array<{
    name: string
    formula: Formula
  }>
  variableArguments: boolean | null
  handler: string
  // exported indicates that an action is exported in a package
  exported?: boolean
}

export interface Route {
  source: RouteDeclaration
  destination: {
    formula: Formula
  }
}
