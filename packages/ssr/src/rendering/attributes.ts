import type {
  Component,
  ComponentData,
  ElementNodeModel,
} from '@toddledev/core/dist/component/component.types'
import type {
  FormulaContext,
  ToddleEnv,
} from '@toddledev/core/dist/formula/formula'
import { applyFormula } from '@toddledev/core/dist/formula/formula'
import { isDefined, toBoolean } from '@toddledev/core/dist/utils/util'

const REGEXP_QUOTE = /"/g
const REGEXP_LT = /</g
const REGEXP_GT = />/g

const validAttrTypes = ['string', 'number', 'boolean']

export const escapeAttrValue = (value: any) => {
  if (!isDefined(value) || !validAttrTypes.includes(typeof value)) {
    return ''
  }
  return escapeHtml(escapeQuote(String(value)))
}

const escapeQuote = (value: string) => {
  return value.replace(REGEXP_QUOTE, '&quot;')
}

const escapeHtml = (html: string) => {
  return html.replace(REGEXP_LT, '&lt;').replace(REGEXP_GT, '&gt;')
}

/**
 * Escape a string to valid HTML text similar to how set innerText would work in the browser
 */
export const toEncodedText = (str: string) => {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('\n', '<br />')
}

export function getNodeAttrs({
  node,
  data,
  component,
  packageName,
  env,
  toddle,
}: {
  node: Pick<ElementNodeModel, 'attrs' | 'style-variables'>
  data: ComponentData
  component: Component
  packageName: string | undefined
  env: ToddleEnv
  toddle: FormulaContext['toddle']
}) {
  const { style, ...restAttrs } = node.attrs
  const nodeAttrs = Object.entries(restAttrs).reduce<string[]>(
    (appliedAttributes, [name, attrValue]) => {
      const value = applyFormula(attrValue, {
        data,
        component,
        package: packageName,
        env,
        toddle,
      })
      if (toBoolean(value)) {
        appliedAttributes.push(`${name}="${escapeAttrValue(value)}"`)
      }
      return appliedAttributes
    },
    [],
  )
  const styleVariables = Object.values(node['style-variables'] ?? {}).map(
    ({ name, formula, unit }) =>
      `--${name}: ${
        String(
          applyFormula(formula, {
            data,
            component,
            package: packageName,
            env,
            toddle,
          }),
        ) + (unit ?? '')
      }`,
  )

  // Handle the style-attribute independently to merge with style variables
  const styles = [
    ...(style
      ? [
          applyFormula(style, {
            data,
            component,
            package: packageName,
            env,
            toddle,
          }),
        ]
      : []),
    ...styleVariables,
  ]
    .filter(Boolean)
    .map(String)
    .join('; ')
  if (styles.length > 0) {
    return [...nodeAttrs, `style="${escapeAttrValue(styles)};"`].join(' ')
  }

  return nodeAttrs.join(' ')
}
