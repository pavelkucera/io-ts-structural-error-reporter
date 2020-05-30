import { pipe } from 'fp-ts/lib/pipeable'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as t from 'io-ts'

type ErrorReportObject = { [key: string]: ErrorReport }

type ErrorReport =
  | string
  | ErrorReportObject

type ErrorContext = ReadonlyNonEmptyArray<t.ContextEntry>

const errorMessage = (defaultMessage: string|undefined, context: ErrorContext): string =>
  defaultMessage !== undefined
    ? defaultMessage
    : `Expecting "${RNEA.last(context).type.name}".`

export const buildErrorReportObject = (message: string, context: ErrorContext): ErrorReport =>
  pipe(
    context,
    RNEA.reduceRight(
      message,
      (contextEntry: t.ContextEntry, childReport: ErrorReport): ErrorReport => ({
        [contextEntry.key]: childReport
      })
    )
  )
