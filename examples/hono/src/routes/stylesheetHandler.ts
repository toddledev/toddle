import { isPageComponent } from '@nordcraft/core/dist/component/isPageComponent'
import { createStylesheet } from '@nordcraft/core/dist/styling/style.css'
import { theme as defaultTheme } from '@nordcraft/core/dist/styling/theme.const'
import { takeIncludedComponents } from '@nordcraft/ssr/dist/components/utils'
import type { Context } from 'hono'
import type { HonoEnv } from '../../hono'

export const stylesheetHandler = async (
  c: Context<HonoEnv, '/.toddle/stylesheet/:pageName{.+.css}'>,
) => {
  const project = c.var.project
  let pageName = c.req.param('pageName')
  // Remove the .css extension
  pageName = pageName.slice(0, '.css'.length * -1)
  const page = project.files.components[pageName]
  if (!page || !isPageComponent(page)) {
    return new Response(null, {
      headers: { 'content-type': 'text/css' },
      status: 404,
    })
  }
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

  const styles = createStylesheet(page, includedComponents, theme, {
    // The reset stylesheet is loaded separately
    includeResetStyle: false,
    // Font faces are created from a stylesheet referenced in the head
    createFontFaces: false,
  })
  return c.text(styles, 200, { 'content-type': 'text/css' })
}
