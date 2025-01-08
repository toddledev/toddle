import { PageRoute } from '@toddledev/core/dist/component/component.types'
import {
  applyFormula,
  FormulaContext,
} from '@toddledev/core/dist/formula/formula'

export const getHtmlLanguage = ({
  pageInfo,
  formulaContext,
  defaultLanguage = 'en',
}: {
  pageInfo?: PageRoute['info']
  formulaContext: FormulaContext
  defaultLanguage?: string
}) =>
  pageInfo?.language
    ? applyFormula(pageInfo.language.formula, formulaContext)
    : defaultLanguage

export const getCharset = ({
  pageInfo,
  formulaContext,
  defaultCharset = 'utf-8',
}: {
  pageInfo?: PageRoute['info']
  formulaContext: FormulaContext
  defaultCharset?: string
}) =>
  pageInfo?.charset
    ? applyFormula(pageInfo.charset.formula, formulaContext)
    : defaultCharset
