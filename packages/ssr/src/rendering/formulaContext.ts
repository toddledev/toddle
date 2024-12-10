import type { PageComponent } from '@toddledev/core/dist/component/component.types'
import {
  applyFormula,
  FormulaContext,
  ToddleServerEnv,
} from '@toddledev/core/dist/formula/formula'
import {
  isToddleFormula,
  PluginFormula,
} from '@toddledev/core/dist/formula/formulaTypes'
import { FormulaHandler } from '@toddledev/core/dist/types'
import { mapValues } from '@toddledev/core/dist/utils/collections'
import { isDefined } from '@toddledev/core/dist/utils/util'
import * as libFormulas from '@toddledev/std-lib/dist/formulas'
import { getPathSegments } from '../routing/routing'
import { ProjectFiles } from '../ssr.types'
import { getRequestCookies } from './cookies'
import { escapeSearchParameters } from './request'

/**
 * Builds a FormulaContext that can be used to evaluate formulas for a page component
 * It also initializes data->Variables with their initial values based on the FormulaContext
 */
export const getPageFormulaContext = ({
  branchName,
  component,
  req,
  files,
}: {
  branchName: string
  component: PageComponent
  req: Request
  files: ProjectFiles
}): FormulaContext => {
  const env = serverEnv({ req, branchName })
  const { searchParamsWithDefaults, hash, combinedParams, url } = getParameters(
    { component, req },
  )
  const coreFormulas = new Map<string, FormulaHandler>()
  Object.entries(libFormulas).forEach(([name, module]) =>
    coreFormulas.set('@toddle/' + name, module.default as any),
  )
  const formulaContext: FormulaContext = {
    data: {
      Location: {
        page: component.page ?? '',
        path: url.pathname,
        params: combinedParams,
        query: searchParamsWithDefaults,
        hash,
      },
      Attributes: combinedParams,
      // Path and query parameters are referenced in a flat structure in formulas
      // hence, we need to merge them. We prefer path parameters over query parameters
      // in case of naming collisions
      'URL parameters': {
        ...searchParamsWithDefaults,
        ...combinedParams,
      } as Record<string, string>,
      Apis: {} as Record<string, any>,
    },
    component,
    root: null,
    package: undefined,
    env,
    toddle: {
      getFormula: (name: string) => coreFormulas.get(name),
      getCustomFormula: (name: string, packageName: string | undefined) => {
        let formula: PluginFormula<string> | undefined

        if (isDefined(packageName)) {
          formula = files.packages?.[packageName]?.formulas?.[name]
        } else {
          formula = files.formulas?.[name]
        }

        if (formula && isToddleFormula(formula)) {
          return formula
        }
      },
    },
  }
  formulaContext.data.Variables = mapValues(
    component.variables,
    ({ initialValue }) => {
      return applyFormula(initialValue, formulaContext)
    },
  )
  return formulaContext
}

const getParameters = ({
  component,
  req,
}: {
  component: PageComponent
  req: Request
}) => {
  const url = new URL(req.url)
  const searchParams = [
    ...escapeSearchParameters(url.searchParams).entries(),
  ].reduce<
    Record<string, string | null>
    // avoid undefined values in the searchParams
  >(
    (params, [key, val]) => ({
      ...params,
      [key]: val ?? null,
    }),
    {},
  )
  const params: Record<string, string | null> = { ...searchParams }
  const pathSegments = getPathSegments(url)
  component.route?.path.forEach((p, i) => {
    if (p.type === 'param') {
      if (isDefined(pathSegments[i]) && typeof pathSegments[i] === 'string') {
        params[p.name] = pathSegments[i]
      } else {
        // Explicitly set path parameters to null by default
        // to avoid undefined values when serializing for the runtime
        params[p.name] = null
      }
    }
  })

  // Explicitly set all query params to null by default
  // to avoid undefined values in the runtime
  const defaultQueryParams = Object.keys(component.route?.query ?? {}).reduce<
    Record<string, null>
  >((params, key) => ({ ...params, [key]: null }), {})
  return {
    combinedParams: params,
    hash: url.hash.slice(1),
    searchParamsWithDefaults: { ...defaultQueryParams, ...searchParams },
    url,
  }
}

export const serverEnv = ({
  branchName,
  req,
}: {
  branchName: string
  req: Request
}) =>
  ({
    branchName: branchName,
    // isServer will be true for SSR + proxied requests
    isServer: true,
    request: {
      headers: Object.fromEntries(req.headers.entries()),
      cookies: getRequestCookies(req),
      url: req.url,
    },
  }) as ToddleServerEnv
