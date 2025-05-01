import type { Formula } from './formula'

export interface BaseFormula {
  name: string
  description?: string
  arguments: Array<{
    name: string
    formula?: Formula | null
    testValue?: unknown
  }>
  // exported indicates that a formula is exported in a package
  exported?: boolean
  variableArguments?: boolean | null
}

export interface ToddleFormula extends BaseFormula {
  formula: Formula
}

/**
 * The Handler generic is a string server side, but a function client side
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export interface CodeFormula<Handler = string | Function> extends BaseFormula {
  version?: 2 | never
  handler: Handler
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type PluginFormula<Handler = string | Function> =
  | ToddleFormula
  | CodeFormula<Handler>

export const isToddleFormula = <Handler>(
  formula: PluginFormula<Handler>,
): formula is ToddleFormula => Object.hasOwn(formula, 'formula')

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export interface GlobalFormulas<Handler = string | Function> {
  formulas?: Record<string, PluginFormula<Handler>>
  packages?: Partial<
    Record<string, { formulas?: Record<string, PluginFormula<Handler>> }>
  >
}
