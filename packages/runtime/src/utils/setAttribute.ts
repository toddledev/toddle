import { isDefined, toBoolean } from '@toddledev/core/dist/utils/util'

/**
 * Some attributes need special handling.
 */
export function setAttribute(
  elem: HTMLElement | SVGElement,
  attr: string,
  value: any,
) {
  switch (attr) {
    case 'srcObject':
    case 'src':
      if (elem instanceof HTMLMediaElement) {
        ;(elem as any)[attr] = value
      } else {
        elem.setAttribute(attr, String(value))
      }
      break
    case 'value':
    case 'type': {
      let val = value
      if (elem instanceof HTMLProgressElement) {
        if (!isDefined(value) || !Number.isFinite(Number(value))) {
          val = 0
        }
      }
      ;(elem as any)[attr] = toBoolean(val) ? String(val) : undefined
      break
    }
    case 'muted':
    case 'autoplay':
      if (elem instanceof HTMLMediaElement) {
        ;(elem as any)[attr] = toBoolean(value)
      } else {
        elem.setAttribute(attr, String(value))
      }
      break
    default:
      if (toBoolean(value)) {
        elem.setAttribute(attr, String(value))
        if (
          // autofocus often does not work in the editor
          attr === 'autofocus' &&
          document.body.getAttribute('data-mode') !== 'design'
        ) {
          setTimeout(() => elem.focus(), 100)
        }
      } else {
        elem.removeAttribute(attr)
      }
  }
}
