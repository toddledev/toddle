import type {
  ActionModel,
  ComponentData,
} from '@toddledev/core/dist/component/component.types'
import { applyFormula } from '@toddledev/core/dist/formula/formula'
import { mapValues, omitKeys } from '@toddledev/core/dist/utils/collections'
import { isDefined, toBoolean } from '@toddledev/core/dist/utils/util'
import { isContextApiV2 } from '../api/apiUtils'
import type { ComponentContext } from '../types'

// eslint-disable-next-line max-params
export function handleAction(
  action: ActionModel,
  data: ComponentData,
  ctx: ComponentContext,
  event?: Event,
) {
  try {
    if (!action) {
      throw new Error('Action does not exist')
    }
    switch (action.type) {
      case 'Switch': {
        // find the first case that resolves to true.
        // Only one case in a switch will be executed.
        const actionList =
          action.cases.find(({ condition }) =>
            toBoolean(
              applyFormula(condition, {
                data,
                component: ctx.component,
                formulaCache: ctx.formulaCache,
                root: ctx.root,
                package: ctx.package,
                toddle: ctx.toddle,
                env: ctx.env,
              }),
            ),
          ) ?? action.default
        if (!actionList) {
          return
        }
        // handle all actions for the case
        for (const action of actionList.actions) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          handleAction(action, { ...data, ...ctx.dataSignal.get() }, ctx, event)
        }
        break
      }
      case 'SetVariable': {
        const value = applyFormula(action.data, {
          data,
          component: ctx.component,
          formulaCache: ctx.formulaCache,
          root: ctx.root,
          package: ctx.package,
          toddle: ctx.toddle,
          env: ctx.env,
        })
        ctx.dataSignal.update((data) => {
          return {
            ...data,
            Variables: {
              ...data.Variables,
              [action.variable]: value,
            },
          }
        })
        break
      }
      case 'TriggerEvent': {
        const payload = applyFormula(action.data, {
          data,
          component: ctx.component,
          formulaCache: ctx.formulaCache,
          root: ctx.root,
          package: ctx.package,
          toddle: ctx.toddle,
          env: ctx.env,
        })
        ctx.triggerEvent(action.event, payload)
        break
      }
      case 'SetURLParameter': {
        ctx.toddle.locationSignal.update((current) => {
          const value = applyFormula(action.data, {
            data,
            component: ctx.component,
            formulaCache: ctx.formulaCache,
            root: ctx.root,
            package: ctx.package,
            toddle: ctx.toddle,
            env: ctx.env,
          })
          if (current.route?.path.some((p) => p.name === action.parameter)) {
            return {
              ...current,
              params: {
                ...omitKeys(current.params, [action.parameter]),
                [action.parameter]: value,
              },
            }
          } else {
            return {
              ...current,
              query: {
                ...omitKeys(current.query, [action.parameter]),
                ...(isDefined(value) ? { [action.parameter]: value } : null),
              },
            }
          }
        })
        break
      }
      case 'Fetch': {
        const api = ctx.apis[action.api]
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!api) {
          console.error('The api ', action.api, 'does not exist')
          return
        }

        if (isContextApiV2(api)) {
          // Evaluate potential inputs here to make sure the api have the right values
          // This is needed if the inputs are formulas referencing workflow parameters
          const actionInputs = mapValues(action.inputs ?? {}, (input) =>
            applyFormula(input.formula, {
              data,
              component: ctx.component,
              formulaCache: ctx.formulaCache,
              root: ctx.root,
              package: ctx.package,
              toddle: ctx.toddle,
              env: ctx.env,
            }),
          )
          const actionModels = {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            onCompleted: action.onSuccess?.actions ?? [],
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            onFailed: action.onError?.actions ?? [],
            onMessage: action.onMessage?.actions ?? [],
          }
          void api.fetch({ actionInputs, actionModels, componentData: data })
        } else {
          const triggerActions = (actions: ActionModel[]) => {
            for (const subAction of actions) {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              handleAction(
                subAction,
                { ...data, ...ctx.dataSignal.get() },
                ctx,
                event,
              )
            }
          }
          api.fetch().then(
            () => {
              triggerActions(action.onSuccess.actions)
            },
            () => {
              triggerActions(action.onError.actions)
            },
          )
        }

        break
      }
      case 'TriggerWorkflow': {
        const parameters = mapValues(action.parameters ?? {}, (parameter) =>
          applyFormula(parameter.formula, {
            data,
            component: ctx.component,
            formulaCache: ctx.formulaCache,
            root: ctx.root,
            package: ctx.package,
            toddle: ctx.toddle,
            env: ctx.env,
          }),
        )

        if (action.contextProvider) {
          const provider =
            ctx.providers[
              [ctx.package, action.contextProvider].filter(isDefined).join('/')
            ] ?? ctx.providers[action.contextProvider]
          const workflow = provider?.component.workflows?.[action.workflow]
          if (!workflow) {
            if (provider) {
              console.warn(
                `Cannot find workflow "${action.workflow}" on component "${action.contextProvider}". It has likely been removed or modified.`,
              )
            }
            return
          }

          workflow.actions.forEach((action) =>
            handleAction(
              action,
              {
                ...data,
                ...provider.ctx.dataSignal.get(),
                Parameters: parameters,
              },
              provider.ctx,
              event,
            ),
          )
          return
        }

        const workflow = ctx.component.workflows?.[action.workflow]
        if (!workflow) {
          console.warn(
            `Workflow ${action.workflow} does not exist on component ${ctx.component.name}`,
          )
          return
        }

        workflow.actions.forEach((action) =>
          handleAction(
            action,
            {
              ...data,
              ...ctx.dataSignal.get(),
              Parameters: parameters,
            },
            ctx,
            event,
          ),
        )
        break
      }
      default: {
        try {
          // create a handler for actions triggering events
          const triggerActionEvent = (trigger: string, eventData: any) => {
            const subEvent = action.events?.[trigger]
            if (subEvent) {
              subEvent.actions.forEach((action) =>
                handleAction(
                  action,
                  eventData
                    ? { ...data, ...ctx.dataSignal.get(), Event: eventData }
                    : { ...data, ...ctx.dataSignal.get() },
                  ctx,
                  eventData ?? event,
                ),
              )
            }
          }
          const newAction =
            action.version === 2
              ? (ctx.toddle.getCustomAction ?? ctx.toddle.getCustomAction)(
                  action.name,
                  action.package ?? ctx.package,
                )
              : undefined
          if (newAction) {
            // First evaluate any arguments (input) to the action
            const args = (action.arguments ?? []).reduce<
              Record<string, unknown>
            >(
              (args, arg) => ({
                ...args,
                [arg.name]: applyFormula(arg.formula, {
                  data,
                  component: ctx.component,
                  formulaCache: ctx.formulaCache,
                  root: ctx.root,
                  package: ctx.package,
                  toddle: ctx.toddle,
                  env: ctx.env,
                }),
              }),
              {},
            )
            const result = newAction.handler?.(
              args,
              {
                root: ctx.root,
                triggerActionEvent,
              },
              event,
            )
            // If the result is a function, then it should behave as a cleanup function, that runs, usually when the component is unmounted.
            // Useful for removeEventListeners, clearTimeout, etc.
            if (
              result &&
              (typeof result === 'function' || result instanceof Promise)
            ) {
              ctx.dataSignal.subscribe((data) => data, {
                destroy: () => {
                  if (result instanceof Promise) {
                    result
                      .then((cleanup) => {
                        if (typeof cleanup === 'function') {
                          cleanup()
                        }
                      })
                      .catch((err) => console.error(err))
                  } else {
                    result()
                  }
                },
              })
            }

            return result
          } else {
            const legacyHandler = ctx.toddle.getAction(action.name)
            if (!legacyHandler) {
              console.error('Missing custom action', action.name)
              return
            }
            // First evaluate any arguments (input) to the action
            const args = action.arguments?.map((arg) =>
              applyFormula(arg.formula, {
                data,
                component: ctx.component,
                formulaCache: ctx.formulaCache,
                root: ctx.root,
                package: ctx.package,
                toddle: ctx.toddle,
                env: ctx.env,
              }),
            ) ?? [
              applyFormula(action.data, {
                data,
                component: ctx.component,
                formulaCache: ctx.formulaCache,
                root: ctx.root,
                package: ctx.package,
                toddle: ctx.toddle,
                env: ctx.env,
              }),
            ] // action.data is a fallback to handle an older version of the action spec.
            return legacyHandler(args, { ...ctx, triggerActionEvent }, event)
          }
        } catch (err) {
          console.error('Error in Custom Action', err)
        }
      }
    }
  } catch (e) {
    console.error(e)
    return null
  }
}
