/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import type { Component } from '@nordcraft/core/dist/component/component.types'

export const isContextProvider = (component: Component) =>
  (component.formulas &&
    Object.values(component.formulas).some(
      ({ exposeInContext }) => exposeInContext,
    )) ||
  (component.workflows &&
    Object.values(component.workflows).some(
      ({ exposeInContext }) => exposeInContext,
    ))
