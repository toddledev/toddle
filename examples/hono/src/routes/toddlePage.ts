import { ToddleComponent } from '@toddledev/core/dist/component/ToddleComponent'
import {
  applyFormula,
  type ToddleServerEnv,
} from '@toddledev/core/dist/formula/formula'
import { createStylesheet } from '@toddledev/core/dist/styling/style.css'
import { theme as defaultTheme } from '@toddledev/core/dist/styling/theme.const'
import { isDefined } from '@toddledev/core/dist/utils/util'
import { takeIncludedComponents } from '@toddledev/ssr/dist/components/utils'
import { renderPageBody } from '@toddledev/ssr/dist/rendering/components'
import { getPageFormulaContext } from '@toddledev/ssr/dist/rendering/formulaContext'
import { getHtmlLanguage } from '@toddledev/ssr/dist/rendering/html'
import {
  get404Page,
  matchPageForUrl,
} from '@toddledev/ssr/dist/routing/routing'
import type { Context } from 'hono'
import { html, raw } from 'hono/html'
import type { HonoEnv } from '../../hono'

export const toddlePage = async (c: Context<HonoEnv>) => {
  const url = new URL(c.req.url)
  let page = matchPageForUrl({
    url,
    components: c.env.project.files.components,
  })
  if (!page) {
    page = get404Page(c.env.project.files.components)
    if (!page) {
      return c.html('Page not found', { status: 404 })
    }
  }
  const formulaContext = getPageFormulaContext({
    component: page,
    branchName: 'main',
    req: c.req.raw,
    logErrors: true,
    files: c.env.project.files,
  })
  const language = getHtmlLanguage({
    pageInfo: page.route.info,
    formulaContext,
    defaultLanguage: 'en',
  })

  // Find the theme to use for the page
  const theme =
    (c.env.project.files.themes
      ? Object.values(c.env.project.files.themes)[0]
      : c.env.project.files.config?.theme) ?? defaultTheme

  // Get all included components on the page
  const includedComponents = takeIncludedComponents({
    root: page,
    projectComponents: c.env.project.files.components,
    packages: c.env.project.files.packages,
    includeRoot: true,
  })

  // Currently, styles are inlined, but we want to serve these from a separate endpoint
  const styles = createStylesheet(page, includedComponents, theme, {
    includeResetStyle: false,
    // Font faces are created from a stylesheet referenced in the head
    createFontFaces: false,
  })
  const toddleComponent = new ToddleComponent<string>({
    component: page,
    getComponent: (name, packageName) => {
      const nodeLookupKey = [packageName, name].filter(isDefined).join('/')
      const component = packageName
        ? c.env.project.files.packages?.[packageName]?.components[name]
        : c.env.project.files.components[name]
      if (!component) {
        console.warn(`Unable to find component ${nodeLookupKey} in files`)
        return undefined
      }

      return component
    },
    packageName: undefined,
    globalFormulas: {
      formulas: c.env.project.files.formulas,
      packages: c.env.project.files.packages,
    },
  })
  const { html: body } = await renderPageBody({
    component: toddleComponent as any, // TODO: Fix typing
    formulaContext,
    env: formulaContext.env as ToddleServerEnv,
    req: c.req.raw,
    files: c.env.project.files,
    includedComponents,
    evaluateComponentApis: async (_) => ({
      // TODO: Show an example of how to evaluate APIs - potentially using an adapter
    }),
    projectId: 'my_project',
  })
  return c.html(
    html`<!doctype html>
      <html lang="${language}">
        <head>
          <meta charset="UTF-8" />
          <title>
            ${applyFormula(page.route.info?.title?.formula, formulaContext) ??
            page.name}
          </title>
          <!-- The rest of the <head> elements are coming soon 🤞 -->
          <link
            rel="stylesheet"
            fetchpriority="high"
            href="/_static/reset.css"
          />
          <style>
            ${styles}
          </style>
        </head>
        <body>
          ${raw(body)}
        </body>
      </html>`,
  )
}
