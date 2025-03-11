import { ToddleComponent } from '@toddledev/core/dist/component/ToddleComponent'
import { type ToddleServerEnv } from '@toddledev/core/dist/formula/formula'
import { theme as defaultTheme } from '@toddledev/core/dist/styling/theme.const'
import type { ToddleInternals } from '@toddledev/core/dist/types'
import { isDefined } from '@toddledev/core/dist/utils/util'
import { takeIncludedComponents } from '@toddledev/ssr/dist/components/utils'
import { renderPageBody } from '@toddledev/ssr/dist/rendering/components'
import { getPageFormulaContext } from '@toddledev/ssr/dist/rendering/formulaContext'
import {
  getHeadItems,
  renderHeadItems,
} from '@toddledev/ssr/dist/rendering/head'
import { getCharset, getHtmlLanguage } from '@toddledev/ssr/dist/rendering/html'
import {
  get404Page,
  matchPageForUrl,
  matchRouteForUrl,
} from '@toddledev/ssr/dist/routing/routing'
import { hasCustomCode } from '@toddledev/ssr/src/custom-code/codeRefs'
import { removeTestData } from '@toddledev/ssr/src/rendering/testData'
import type { Context } from 'hono'
import { html, raw } from 'hono/html'
import type { HonoEnv } from '../../hono'
import { routeHandler } from './routeHandler'

export const toddlePage = async (c: Context<HonoEnv>) => {
  const project = c.var.project
  const url = new URL(c.req.url)
  // Prefer routes over pages in case of conflicts
  const route = matchRouteForUrl({ url, routes: project.files.routes })
  if (route) {
    return routeHandler(c, route)
  }
  let page = matchPageForUrl({
    url,
    components: project.files.components,
  })
  if (!page) {
    page = get404Page(project.files.components)
    if (!page) {
      return c.html('Page not found', { status: 404 })
    }
  }
  const formulaContext = getPageFormulaContext({
    component: page,
    branchName: 'main',
    req: c.req.raw,
    logErrors: true,
    files: project.files,
  })
  const language = getHtmlLanguage({
    pageInfo: page.route.info,
    formulaContext,
    defaultLanguage: 'en',
  })

  // Find the theme to use for the page
  const theme =
    (project.files.themes
      ? Object.values(project.files.themes)[0]
      : project.files.config?.theme) ?? defaultTheme

  // Get all included components on the page
  const includedComponents = takeIncludedComponents({
    root: page,
    projectComponents: project.files.components,
    packages: project.files.packages,
    includeRoot: true,
  })

  const toddleComponent = new ToddleComponent<string>({
    component: page,
    getComponent: (name, packageName) => {
      const nodeLookupKey = [packageName, name].filter(isDefined).join('/')
      const component = packageName
        ? project.files.packages?.[packageName]?.components[name]
        : project.files.components[name]
      if (!component) {
        console.warn(`Unable to find component ${nodeLookupKey} in files`)
        return undefined
      }

      return component
    },
    packageName: undefined,
    globalFormulas: {
      formulas: project.files.formulas,
      packages: project.files.packages,
    },
  })
  const head = renderHeadItems({
    headItems: getHeadItems({
      url,
      // This refers to the endpoint we created in fontRouter for our proxied stylesheet
      cssBasePath: '/.toddle/fonts/stylesheet/css2',
      page: toddleComponent,
      files: project.files,
      project: project.project,
      context: formulaContext,
      theme,
    }),
  })
  const { html: body } = await renderPageBody({
    component: toddleComponent,
    formulaContext,
    env: formulaContext.env as ToddleServerEnv,
    req: c.req.raw,
    files: project.files,
    includedComponents,
    evaluateComponentApis: async (_) => ({
      // TODO: Show an example of how to evaluate APIs - potentially using an adapter
    }),
    projectId: 'my_project',
  })
  const charset = getCharset({
    pageInfo: toddleComponent.route?.info,
    formulaContext,
  })

  // Prepare the data to be passed to the client for hydration
  const toddleInternals: ToddleInternals = {
    project: c.var.project.project.short_id,
    branch: 'main',
    commit: 'unknown',
    pageState: formulaContext.data,
    component: removeTestData(page),
    components: includedComponents.map(removeTestData),
    isPageLoaded: false,
    cookies: Object.keys(formulaContext.env.request.cookies),
  }
  const usesCustomCode = hasCustomCode(toddleComponent, c.var.project.files)
  let codeImport = ''
  if (usesCustomCode) {
    const customCodeSearchParams = new URLSearchParams([
      ['entry', toddleComponent.name],
    ])
    codeImport = `
            <script type="module">
              import { initGlobalObject, createRoot } from '/_static/esm-page.main.js';
              import { loadCustomCode, formulas, actions } from '/.toddle/custom-code.js?${customCodeSearchParams.toString()}';

              window.__toddle = ${JSON.stringify(toddleInternals).replaceAll(
                '</script>',
                '<\\/script>',
              )};
              window.__toddle.components = [window.__toddle.component, ...window.__toddle.components];
              initGlobalObject({formulas, actions});
              loadCustomCode();
              createRoot(document.getElementById("App"));
            </script>
          `
  } else {
    codeImport = `
        <script type="module">
          import { initGlobalObject, createRoot } from '/_static/esm-page.main.js';

          window.__toddle = ${JSON.stringify(toddleInternals).replaceAll(
            '</script>',
            '<\\/script>',
          )};
          window.__toddle.components = [window.__toddle.component, ...window.__toddle.components];
          initGlobalObject({formulas: {}, actions: {}});
          createRoot(document.getElementById("App"));
        </script>
    `
  }

  return c.html(
    html`<!doctype html>
      <html lang="${language}">
        <head>
          ${raw(head)} ${raw(codeImport)}
        </head>
        <body>
          <div id="App">${raw(body)}</div>
        </body>
      </html>`,
    {
      headers: {
        'Content-Type': `text/html; charset=${charset}`,
      },
    },
  )
}
