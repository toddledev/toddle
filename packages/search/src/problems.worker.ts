import type { ProjectFiles } from '@toddledev/ssr/dist/ssr.types'
import { createActionNameRule } from './rules/createActionNameRule'
import { createRequiredDirectChildRule } from './rules/createRequiredDirectChildRule'
import { createRequiredDirectParentRule } from './rules/createRequiredDirectParentRule'
import { createRequiredElementAttributeRule } from './rules/createRequiredElementAttributeRule'
import { createRequiredMetaTagRule } from './rules/createRequiredMetaTagRule'
import { duplicateEventTriggerRule } from './rules/duplicateEventTriggerRule'
import { duplicateUrlParameterRule } from './rules/duplicateUrlParameterRule'
import { imageWithoutDimensionRule } from './rules/imageWithoutDimensionRule'
import { legacyActionRule } from './rules/legacyActionRule'
import { legacyFormulaRule } from './rules/legacyFormulaRule'
import { noContextConsumersRule } from './rules/noContextConsumersRule'
import { noReferenceApiRule } from './rules/noReferenceApiRule'
import { noReferenceAttributeRule } from './rules/noReferenceAttributeRule'
import { noReferenceComponentFormulaRule } from './rules/noReferenceComponentFormulaRule'
import { noReferenceComponentRule } from './rules/noReferenceComponentRule'
import { noReferenceComponentWorkflowRule } from './rules/noReferenceComponentWorkflowRule'
import { noReferenceProjectFormulaRule } from './rules/noReferenceProjectFormulaRule'
import { noReferenceVariableRule } from './rules/noReferenceVariableRule'
import { noUnnecessaryConditionFalsy } from './rules/noUnnecessaryConditionFalsy'
import { noUnnecessaryConditionTruthy } from './rules/noUnnecessaryConditionTruthy'
import { unknownApiRule } from './rules/unknownApiRule'
import { unknownAttributeRule } from './rules/unknownAttributeRule'
import { unknownClassnameRule } from './rules/unknownClassnameRule'
import { unknownComponentSlotRule } from './rules/unknownComponentSlotRule'
import { unknownContextFormulaRule } from './rules/unknownContextFormulaRule'
import { unknownContextProviderFormulaRule } from './rules/unknownContextProviderFormulaRule'
import { unknownContextProviderRule } from './rules/unknownContextProviderRule'
import { unknownContextProviderWorkflowRule } from './rules/unknownContextProviderWorkflowRule'
import { unknownContextWorkflowRule } from './rules/unknownContextWorkflowRule'
import { unknownFormulaRule } from './rules/unknownFormulaRule'
import { unknownProjectActionRule } from './rules/unknownProjectActionRule'
import { unknownProjectFormulaRule } from './rules/unknownProjectFormulaRule'
import { unknownUrlParameterRule } from './rules/unknownUrlParameterRule'
import { unknownVariableRule } from './rules/unknownVariableRule'
import { unknownVariableSetterRule } from './rules/unknownVariableSetterRule'
import { searchProject } from './searchProject'
import { ApplicationState, Category, Level, Result } from './types'

export type Options = {
  /**
   * Useful for running search on a subset or a single file.
   */
  pathsToVisit?: string[][]
  /**
   * Search only rules with these specific categories. If empty, all categories are shown.
   */
  categories?: Category[]
  /**
   * Search only rules with the specific levels. If empty, all levels are shown.
   */
  levels?: Level[]
  /**
   * The number of reports to send per message.
   * @default 1
   */
  batchSize?: number | 'all' | 'per-file'
  /**
   * Dynamic data that is used by some rules.
   */
  state?: ApplicationState
}

const RULES = [
  createActionNameRule({ name: '@toddle/logToConsole', code: 'no-console' }),
  createRequiredElementAttributeRule('a', 'href'),
  createRequiredElementAttributeRule('img', 'alt'),
  createRequiredElementAttributeRule('img', 'src'),
  createRequiredMetaTagRule('description'),
  createRequiredMetaTagRule('title'),
  createRequiredDirectChildRule(['ul', 'ol'], ['li', 'script', 'template']),
  createRequiredDirectParentRule(['ul', 'ol'], ['li']),
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table#technical_summary
  createRequiredDirectChildRule(
    ['table'],
    ['caption', 'colgroup', 'tbody', 'thead', 'tfoot', 'tr'],
  ),
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#technical_summary
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead#technical_summary
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tfoot#technical_summary
  createRequiredDirectParentRule(['table'], ['tbody', 'thead', 'tfoot']),
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr#technical_summary
  createRequiredDirectChildRule(['tr'], ['th', 'td', 'script', 'template']),
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#technical_summary
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#technical_summary
  createRequiredDirectParentRule(['tr'], ['th', 'td']),
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#technical_summary
  createRequiredDirectChildRule(['select'], ['option', 'optgroup', 'hr']),
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup#technical_summary
  createRequiredDirectChildRule(['optgroup'], ['option']),
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/legend#technical_summary
  createRequiredDirectParentRule(['fieldset'], ['legend']),
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl#technical_summary
  createRequiredDirectChildRule(['dl'], ['dd', 'dt', 'script', 'template']),
  imageWithoutDimensionRule,
  duplicateEventTriggerRule,
  duplicateUrlParameterRule,
  legacyActionRule,
  legacyFormulaRule,
  // requireExtensionRule,
  noContextConsumersRule,
  noReferenceApiRule,
  noReferenceAttributeRule,
  noReferenceComponentFormulaRule,
  noReferenceComponentRule,
  noReferenceComponentWorkflowRule,
  noReferenceProjectFormulaRule,
  noReferenceVariableRule,
  noUnnecessaryConditionFalsy,
  noUnnecessaryConditionTruthy,
  unknownApiRule,
  unknownAttributeRule,
  unknownComponentSlotRule,
  unknownClassnameRule,
  unknownContextFormulaRule,
  unknownContextProviderFormulaRule,
  unknownContextProviderRule,
  unknownContextProviderWorkflowRule,
  unknownContextWorkflowRule,
  // unknownCookieRule,
  unknownFormulaRule,
  unknownProjectActionRule,
  unknownProjectFormulaRule,
  unknownUrlParameterRule,
  unknownVariableRule,
  unknownVariableSetterRule,
]

/**
 * This function is a web worker that checks for problems in the files.
 */
onmessage = (
  event: MessageEvent<{ files: ProjectFiles; options?: Options }>,
) => {
  const { files, options = {} } = event.data
  const rules = RULES.filter(
    (rule) =>
      (!options.categories || options.categories.includes(rule.category)) &&
      (!options.levels || options.levels.includes(rule.level)),
  )

  let batch: Result[] = []
  let fileType: string | number | undefined
  let fileName: string | number | undefined
  for (const problem of searchProject({
    files,
    rules,
    pathsToVisit: options.pathsToVisit,
    state: options.state,
  })) {
    switch (options.batchSize) {
      case 'all': {
        batch.push(problem)
        break
      }
      case 'per-file': {
        if (fileType !== problem.path[0] || fileName !== problem.path[1]) {
          if (batch.length > 0) {
            postMessage(batch)
          }
          batch = []
          fileType = problem.path[0]
          fileName = problem.path[1]
        }

        batch.push(problem)
        break
      }

      default: {
        batch.push(problem)
        if (batch.length >= (options.batchSize ?? 1)) {
          postMessage(batch)
          batch = []
        }
        break
      }
    }
  }

  // Send the remaining results
  postMessage(batch)
}
