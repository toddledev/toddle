import { isDefined } from '../utils/util'
import type { Component, PageComponent } from './component.types'

export const isPageComponent = (
  component: Component,
): component is PageComponent => isDefined(component.route)
