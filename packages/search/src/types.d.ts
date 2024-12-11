/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type {
  ApiRequest,
  ComponentAPI,
} from '@toddledev/core/dist/api/apiTypes'
import type {
  ActionModel,
  Component,
  ElementNodeModel,
  NodeModel,
  StyleVariant,
} from '@toddledev/core/dist/component/component.types'
import type { ToddleComponent } from '@toddledev/core/dist/component/ToddleComponent'
import type { Formula } from '@toddledev/core/dist/formula/formula'
import type { PluginFormula } from '@toddledev/core/dist/formula/formulaTypes'
import type { Theme } from '@toddledev/core/dist/styling/theme'
import type { ProjectFiles } from '@toddledev/ssr/dist/ssr.types'

type Code =
  | 'duplicate event trigger'
  | 'duplicate url parameter'
  | 'legacy action'
  | 'legacy formula'
  | 'no-console'
  | 'no context consumers'
  | 'no-reference api input'
  | 'no-reference api'
  | 'no-reference attribute'
  | 'no-reference component formula'
  | 'no-reference component workflow'
  | 'no-reference component'
  | 'no-reference project formula'
  | 'no-reference variable'
  | 'no-unnecessary-condition-falsy'
  | 'no-unnecessary-condition-truthy'
  | 'required api autofetch'
  | 'required direct child'
  | 'required direct parent'
  | 'required element attribute'
  | 'required extension'
  | 'required meta tag'
  | 'image without dimension'
  | 'unknown api input'
  | 'unknown api'
  | 'unknown attribute'
  | 'unknown classname'
  | 'unknown component slot'
  | 'unknown context formula'
  | 'unknown context provider formula'
  | 'unknown context provider workflow'
  | 'unknown context provider'
  | 'unknown context workflow'
  | 'unknown cookie'
  | 'unknown formula'
  | 'unknown project action'
  | 'unknown project formula'
  | 'unknown url parameter'
  | 'unknown variable setter'
  | 'unknown variable'

type Category =
  | 'Unknown Reference'
  | 'No References'
  | 'SEO'
  | 'Accessibility'
  | 'Deprecation'
  | 'Performance'
  | 'Security'
  | 'Quality'
  | 'Other'

type Level = 'error' | 'warning' | 'info'

export type Result = {
  path: (string | number)[]
  code: Code
  category: Category
  level: Level
  details?: any
}

interface ApplicationCookie {
  url: string
  name: string
  domain: string
  hostOnly: boolean
  path: string
  secure: boolean
  sameSite: 'no_restriction' | 'lax' | 'strict'
  session: boolean
  expirationDate?: number
}

type HttpOnlyCookie = ApplicationCookie & {
  httpOnly: true
  value: never
}

type NonHttpOnlyCookie = ApplicationCookie & {
  httpOnly: false
  value: string
}

export interface ApplicationState {
  cookiesAvailable?: Array<HttpOnlyCookie | NonHttpOnlyCookie>
  isBrowserExtensionAvailable?: boolean
}

type Base = {
  files: Omit<ProjectFiles, 'config'> & Partial<Pick<ProjectFiles, 'config'>>
  /**
   * The JSON-path
   */
  path: (string | number)[]
  /**
   * Memoization function used to cache the result of an expensive function.
   *
   * Useful for constructing a lookup table for a given key to avoid looking up the same value multiple times. Great for reducing the time complexity of a function from O(n^2) to O(n).
   * @param key A lookup key to store the result of the function. The cache is cleared after each run, but different rules may share the same cache. Example: `['variableInComponent', component.name]`
   * @param fn A function that returns the value to be memoized. This function is only called if the value is not already in the cache already.
   * @returns The value of the memoized function.
   */
  memo: <T>(key: string, fn: () => T) => T
}

type ProjectFormulaNode = {
  nodeType: 'project-formula'
  value: PluginFormula<string>
} & Base

type ProjectActionNode = {
  nodeType: 'project-action'
  value: unknown
} & Base

type ComponentNode = {
  nodeType: 'component'
  value: Component
} & Base

type ComponentAPINode = {
  nodeType: 'component-api'
  value: ComponentAPI
  component: ToddleComponent<Function>
} & Base

type ComponentAPIInputNode = {
  nodeType: 'component-api-input'
  value: ApiRequest['inputs'][0]
  api: ApiRequest
  component: ToddleComponent<Function>
} & Base

type ComponentWorkflowNode = {
  nodeType: 'component-workflow'
  value: {
    name: string
    parameters: {
      name: string
      testValue: any
    }[]
    actions: ActionModel[]
    exposeInContext?: boolean | undefined
  }
  component: ToddleComponent<Function>
} & Base

type ComponentFormulaNode = {
  nodeType: 'component-formula'
  value: {
    name: string
    arguments: {
      name: string
      testValue: any
    }[]
    memoize?: boolean | undefined
    exposeInContext?: boolean | undefined
    formula: Formula
  }
  component: ToddleComponent<Function>
} & Base

type ComponentVariableNode = {
  nodeType: 'component-variable'
  value: Component['variables'][0]
  component: ToddleComponent<Function>
} & Base

type ComponentAttributeNode = {
  nodeType: 'component-attribute'
  value: Component['attributes'][0]
  component: ToddleComponent<Function>
} & Base

type FormulaNode = {
  nodeType: 'formula'
  value: Formula
} & Base

type ActionModelNode = {
  nodeType: 'action-model'
  value: ActionModel
} & Base

type ComponentContext = {
  nodeType: 'component-context'
  value: {
    formulas: string[]
    workflows: string[]
    componentName?: string
    package?: string
  }
} & Base

type ComponentNodeNode = {
  nodeType: 'component-node'
  value: NodeModel
  component: ToddleComponent<Function>
} & Base

type ProjectThemeNode = {
  nodeType: 'project-theme'
  value: Theme
} & Base

type ProjectConfigNode = {
  nodeType: 'project-config'
  value: unknown
} & Base

type StyleVariantNode = {
  nodeType: 'style-variant'
  value: { variant: StyleVariant; element: ElementNodeModel }
} & Base

export type NodeType =
  | ProjectFormulaNode
  | ProjectActionNode
  | ComponentNode
  | ComponentAPINode
  | ComponentAPIInputNode
  | ComponentWorkflowNode
  | ComponentFormulaNode
  | ComponentVariableNode
  | ComponentAttributeNode
  | FormulaNode
  | ActionModelNode
  | ComponentContext
  | ComponentNodeNode
  | StyleVariantNode
  | ProjectThemeNode
  | ProjectConfigNode

export interface Rule<T = unknown, V = NodeType> {
  category: Category
  code: Code
  level: Level
  visit: (
    report: (path: (string | number)[], details?: T) => void,
    data: V,
    state?: ApplicationState | undefined,
  ) => void
}
