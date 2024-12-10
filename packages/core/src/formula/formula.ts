import type { Component, ComponentData } from '../component/component.types'
import type {
  CustomFormulaHandler,
  FormulaHandler,
  FormulaLookup,
  Toddle,
} from '../types'
import { isDefined, toBoolean } from '../utils/util'
import { isToddleFormula } from './formulaTypes'

// Define the some objects types as union of ServerSide and ClientSide runtime types as applyFormula is used in both
declare const window: Window | undefined
declare const document: Document | undefined
type ShadowRoot = DocumentFragment

export type PathOperation = {
  type: 'path'
  path: string[]
}

type FunctionArgument = {
  name?: string
  isFunction?: boolean
  formula: Formula
}

export type FunctionOperation = {
  type: 'function'
  name: string
  package?: string
  arguments: FunctionArgument[]
  variableArguments?: boolean
}

export type RecordOperation = {
  type: 'record'
  entries: FunctionArgument[]
}

export type ObjectOperation = {
  type: 'object'
  arguments?: FunctionArgument[]
}

export type ArrayOperation = {
  type: 'array'
  arguments: Array<{ formula: Formula }>
}

export type OrOperation = {
  type: 'or'
  arguments: Array<{ formula: Formula }>
}

export type AndOperation = {
  type: 'and'
  arguments: Array<{ formula: Formula }>
}

export type ApplyOperation = {
  type: 'apply'
  name: string
  arguments: FunctionArgument[]
}

export type ValueOperation = {
  type: 'value'
  value: string | number | boolean | null | object
}

export type ValueOperationValue = string | number | boolean | null | object

export type SwitchOperation = {
  type: 'switch'
  cases: Array<{
    condition: Formula
    formula: Formula
  }>
  default: Formula
}

export type Formula =
  | FunctionOperation
  | RecordOperation
  | ObjectOperation
  | ArrayOperation
  | PathOperation
  | SwitchOperation
  | OrOperation
  | AndOperation
  | ValueOperation
  | ApplyOperation

export type FormulaContext = {
  component: Component
  formulaCache?: Record<
    string,
    {
      get: (data: ComponentData) => any
      set: (data: ComponentData, result: any) => void
    }
  >
  data: ComponentData
  root?: Document | ShadowRoot | null
  package: string | undefined
  toddle?: {
    getFormula: FormulaLookup
    getCustomFormula: CustomFormulaHandler
  }
  env: ToddleEnv | undefined
}

export type ToddleServerEnv = {
  branchName: string
  // isServer will be true for SSR + proxied requests
  isServer: true
  request: {
    headers: Record<string, string>
    cookies: Record<string, string>
    url: string
  }
  runtime: never
}

export type ToddleEnv =
  | ToddleServerEnv
  | {
      branchName: string
      // isServer will be false for client-side
      isServer: false
      request: undefined
      runtime: 'page' | 'custom-element' | 'preview'
    }

export function isFormula(f: any): f is Formula {
  return f && typeof f === 'object' && typeof f.type === 'string'
}
export function isFormulaApplyOperation(
  formula: Formula,
): formula is ApplyOperation {
  return formula.type === 'apply'
}

export function applyFormula(
  formula: Formula | string | number | undefined | boolean,
  ctx: FormulaContext,
): any {
  if (!isFormula(formula)) {
    return formula
  }
  try {
    switch (formula.type) {
      case 'value':
        return formula.value
      case 'path': {
        return formula.path.reduce(
          (input: any, key) =>
            input && typeof input === 'object' ? input[key] : null,
          ctx.data,
        )
      }
      case 'switch': {
        for (const branch of formula.cases) {
          if (toBoolean(applyFormula(branch.condition, ctx))) {
            return applyFormula(branch.formula, ctx)
          }
        }
        return applyFormula(formula.default, ctx)
      }
      case 'or': {
        for (const entry of formula.arguments) {
          if (toBoolean(applyFormula(entry.formula, ctx))) {
            return true
          }
        }
        return false
      }
      case 'and': {
        for (const entry of formula.arguments) {
          if (!toBoolean(applyFormula(entry.formula, ctx))) {
            return false
          }
        }
        return true
      }
      case 'function': {
        const packageName = formula.package ?? ctx.package
        const newFunc = (
          ctx.toddle ??
          ((globalThis as any).toddle as Toddle<unknown, unknown> | undefined)
        )?.getCustomFormula(formula.name, packageName)
        const legacyFunc: FormulaHandler | undefined = (
          ctx.toddle ?? ((globalThis as any).toddle as Toddle<unknown, unknown>)
        ).getFormula(formula.name)
        if (isDefined(newFunc)) {
          const args = formula.arguments.reduce<Record<string, unknown>>(
            (args, arg, i) => ({
              ...args,
              [arg.name ?? `${i}`]: arg.isFunction
                ? (Args: any) =>
                    applyFormula(arg.formula, {
                      ...ctx,
                      data: {
                        ...ctx.data,
                        Args: ctx.data.Args
                          ? { ...Args, '@toddle.parent': ctx.data.Args }
                          : Args,
                      },
                    })
                : applyFormula(arg.formula, ctx),
            }),
            {},
          )
          try {
            return isToddleFormula(newFunc)
              ? applyFormula(newFunc.formula, {
                  ...ctx,
                  data: { ...ctx.data, Args: args },
                })
              : newFunc.handler(args, {
                  root: ctx.root ?? document,
                  env: ctx.env,
                } as any)
          } catch (e) {
            if (
              typeof window !== 'undefined' &&
              (window as any).toddle.errors
            ) {
              const myWindow = window as any
              myWindow.toddle.errors.push(e as Error)
            }

            console.error(e)
            return null
          }
        } else if (typeof legacyFunc === 'function') {
          const args = formula.arguments.map((arg) =>
            arg.isFunction
              ? (Args: any) =>
                  applyFormula(arg.formula, {
                    ...ctx,
                    data: {
                      ...ctx.data,
                      Args: ctx.data.Args
                        ? { ...Args, '@toddle.parent': ctx.data.Args }
                        : Args,
                    },
                  })
              : applyFormula(arg.formula, ctx),
          )
          try {
            return legacyFunc(args, ctx as any)
          } catch (e) {
            if (
              typeof window !== 'undefined' &&
              (window as any).toddle.errors
            ) {
              const myWindow = window as any
              myWindow.toddle.errors.push(e as Error)
            }

            console.error(e)
            return null
          }
        }
        console.error(
          `Could not find formula ${formula.name} in package ${
            packageName ?? ''
          }`,
          formula,
        )
        return null
      }
      case 'object':
        return Object.fromEntries(
          formula.arguments?.map((entry) => [
            entry.name,
            applyFormula(entry.formula, ctx),
          ]) ?? [],
        )
      case 'record': // object used to be called record, there are still examples in the wild.
        return Object.fromEntries(
          formula.entries.map((entry) => [
            entry.name,
            applyFormula(entry.formula, ctx),
          ]),
        )
      case 'array':
        return formula.arguments.map((entry) =>
          applyFormula(entry.formula, ctx),
        )
      case 'apply': {
        const componentFormula = ctx.component.formulas?.[formula.name]
        if (!componentFormula) {
          console.log(
            'Component does not have a formula with the name ',
            formula.name,
          )
          return null
        }
        const Input = Object.fromEntries(
          formula.arguments.map((arg) =>
            arg.isFunction
              ? [
                  arg.name,
                  (Args: any) =>
                    applyFormula(arg.formula, {
                      ...ctx,
                      data: {
                        ...ctx.data,
                        Args: ctx.data.Args
                          ? { ...Args, '@toddle.parent': ctx.data.Args }
                          : Args,
                      },
                    }),
                ]
              : [arg.name, applyFormula(arg.formula, ctx)],
          ),
        )
        const data = {
          ...ctx.data,
          Args: ctx.data.Args
            ? { ...Input, '@toddle.parent': ctx.data.Args }
            : Input,
        }
        const cache = ctx.formulaCache?.[formula.name]?.get(data)

        if (cache?.hit) {
          return cache.data
        } else {
          const result = applyFormula(componentFormula.formula, {
            ...ctx,
            data,
          })
          ctx.formulaCache?.[formula.name]?.set(data, result)
          return result
        }
      }

      default:
        console.error('Could not recognize formula', formula)
    }
  } catch (e) {
    console.error(e)
    return null
  }
}
