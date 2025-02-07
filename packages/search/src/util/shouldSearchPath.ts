import { ActionModel } from '@toddledev/core/dist/component/component.types'

export function shouldSearchPath(
  path: (string | number)[],
  pathsToVisit: string[][] = [],
) {
  return (
    pathsToVisit.length === 0 ||
    pathsToVisit.some((pathToVisit) =>
      pathToVisit.every((p1, i) => path[i] === p1),
    )
  )
}

export const isLegacyAction = (model: ActionModel) => {
  switch (model.type) {
    case 'Custom':
    case undefined:
      return legacyCustomActions.some(
        (action) => action.name === model.name && action.type === model?.type,
      )
  }
  return false
}

const legacyCustomActions = [
  { type: undefined, name: 'If' },
  { type: undefined, name: 'TriggerEvent' },
]
