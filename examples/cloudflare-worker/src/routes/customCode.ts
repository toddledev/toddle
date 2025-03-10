import type { Component } from '@toddledev/core/dist/component/component.types'
import { isDefined } from '@toddledev/core/dist/utils/util'
import {
  generateCustomCodeFile,
  takeReferencedFormulasAndActions,
} from '@toddledev/ssr/src/custom-code/codeRefs'
import { escapeSearchParameter } from '@toddledev/ssr/src/rendering/request'
import type { Context } from 'hono'
import type { HonoEnv } from '../../hono'

export const customCode = async (c: Context<HonoEnv>) => {
  const url = new URL(c.req.url)
  const entry = escapeSearchParameter(url.searchParams.get('entry'))
  let component: Component | undefined
  if (isDefined(entry)) {
    component = c.var.project.files.components[entry]
    if (!isDefined(component)) {
      return c.text(`Component "${entry}" not found in project`, {
        status: 404,
      })
    }
  }

  const code = takeReferencedFormulasAndActions({
    component,
    files: c.var.project.files,
  })
  const output = generateCustomCodeFile({
    code,
    componentName: component?.name ?? entry ?? undefined,
    projectId: c.var.project.project.short_id,
  })
  const headers: Record<string, string> = {
    'content-type': 'text/javascript',
    'Access-Control-Allow-Origin': '*',
  }
  return new Response(output, {
    headers,
  })
}
