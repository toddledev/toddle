import type { ApiRequest as CoreApiRequest } from '@toddledev/core/dist/api/apiTypes'
import type {
  ActionModel,
  Component,
  ComponentData,
} from '@toddledev/core/dist/component/component.types'
import type {
  Formula,
  ToddleEnv,
  ValueOperationValue,
} from '@toddledev/core/dist/formula/formula'
import type {
  Toddle as NewToddle,
  Toddle,
  ToddleInternals,
} from '@toddledev/core/dist/types'
import type { ApiRequest } from './api/createAPI'
import type { Signal } from './signal/signal'

declare global {
  interface Window {
    __components: Record<string, Signal<ComponentData>> // used for debugging
    __toddle: ToddleInternals
    toddle: NewToddle<LocationSignal, PreviewShowSignal>
  }
}

export type LocationSignal = Signal<{
  route: Component['route']
  page?: string
  path: string
  params: Record<string, string | null>
  query: Record<string, string | string[] | null>
  hash?: string
}>

export type PreviewShowSignal = Signal<{
  displayedNodes: string[]
  testMode: boolean
}>

interface ListItem {
  Item: unknown
  Index: number
  Parent?: ListItem
}

export interface ComponentChild {
  dataSignal: Signal<ComponentData>
  id: string
  path: string
  ctx: ComponentContext
}

export interface ComponentContext {
  component: Component
  components: Component[]
  package: string | undefined
  abortSignal: AbortSignal
  root: Document | ShadowRoot
  isRootComponent: boolean
  dataSignal: Signal<ComponentData>
  triggerEvent: (event: string, data: unknown) => void
  apis: Record<string, ContextApi>
  children: Record<string, Array<ComponentChild>>
  formulaCache: Record<
    string,
    {
      get: (data: ComponentData) => { hit: true; data: any } | { hit: false }
      set: (data: ComponentData, result: any) => void
    }
  >
  providers: Record<
    string,
    {
      component: Component
      formulaDataSignals: Record<string, Signal<ComponentData>>
      ctx: ComponentContext
    }
  >
  toddle: Toddle<LocationSignal, PreviewShowSignal>
  env: ToddleEnv
}

export type ContextApi = ContextApiV1 | ContextApiV2

export interface ContextApiV1 {
  fetch: (api?: ApiRequest) => Promise<unknown>
  destroy: Function
}

export interface ContextApiV2 {
  fetch: (args: {
    actionInputs?: Record<
      string,
      | ValueOperationValue
      | {
          name: string
          formula?: Formula
        }
    >
    actionModels?: {
      onCompleted: ActionModel[]
      onFailed: ActionModel[]
      onMessage: ActionModel[]
    }
    componentData: ComponentData
  }) => Promise<unknown>
  destroy: Function
  update: (newApi: CoreApiRequest, componentData: ComponentData) => void // for updating the dataSignal (v2 only)
  triggerActions: (componentData: ComponentData) => void // for triggering actions explicitly. Useful when initializing apis (v2 only)
}

export type FormulaCache = Record<
  string,
  {
    get: (data: ComponentData) => { hit: true; data: any } | { hit: false }
    set: (data: ComponentData, result: any) => void
  }
>

/**
 * We must specify the namespace for some nodes when created programmatically that are not in the default namespace.
 * In toddle, we infer the namespace based on the tag name, but it would be interesting to also allow the user to specify it explicitly with the `xmlns` attribute.
 */
export type SupportedNamespaces =
  | 'http://www.w3.org/1999/xhtml'
  | 'http://www.w3.org/2000/svg'
  | 'http://www.w3.org/1998/Math/MathML'
