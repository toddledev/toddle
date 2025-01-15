import { ToddleComponent } from '@toddledev/core/dist/component/ToddleComponent'
import { type ToddleServerEnv } from '@toddledev/core/dist/formula/formula'
import { createStylesheet } from '@toddledev/core/dist/styling/style.css'
import { theme as defaultTheme } from '@toddledev/core/dist/styling/theme.const'
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
} from '@toddledev/ssr/dist/routing/routing'
import type { Context } from 'hono'
import { html, raw } from 'hono/html'
import type { HonoEnv } from '../../hono'

export const toddlePage = async (c: Context<HonoEnv>) => {
  const project = c.var.project
  const url = new URL(c.req.url)
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

  // Currently, styles are inlined, but we want to serve these from a separate endpoint
  const styles = createStylesheet(page, includedComponents, theme, {
    includeResetStyle: false,
    // Font faces are created from a stylesheet referenced in the head
    createFontFaces: false,
  })
  const component = new ToddleComponent<string>({
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
  const head = renderHeadItems(
    getHeadItems({
      url,
      page: component,
      files: project.files,
      project: project.project,
      context: formulaContext,
      theme,
    }),
  )
  const { html: body } = await renderPageBody({
    component,
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
    pageInfo: component.route?.info,
    formulaContext,
  })
  return c.html(
    html`<!doctype html>
      <html lang="${language}">
        <head>
          ${raw(head)}
          <style>
            ${styles}
          </style>
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
