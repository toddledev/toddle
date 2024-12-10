import { applyFormula } from '@toddledev/core/dist/formula/formula'
import { getPageFormulaContext } from '@toddledev/ssr/dist/rendering/formulaContext'
import { getHtmlLanguage } from '@toddledev/ssr/dist/rendering/html'
import {
  get404Page,
  matchPageForUrl,
} from '@toddledev/ssr/dist/routing/routing'
import type { Context } from 'hono'
import { html } from 'hono/html'
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
    files: c.env.project.files,
  })
  const language = getHtmlLanguage({
    pageInfo: page.route.info,
    formulaContext,
    defaultLanguage: 'en',
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
        </head>
        <body>
          <h1>${page.name}</h1>
        </body>
      </html>`,
  )
}
