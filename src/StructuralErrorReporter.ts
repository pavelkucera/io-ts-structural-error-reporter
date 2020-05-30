import { pipe } from 'fp-ts/lib/pipeable'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'
import { Either } from 'fp-ts/lib/Either'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as R from 'fp-ts/lib/Record'
import * as E from 'fp-ts/lib/Either'
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

type Merged<A extends ErrorReportObject> = Either<string, A>

export const mergeAtKey = (
  key: string,
  childErrorReport: ErrorReport,
  errorReportResult: Merged<ErrorReportObject>
): Merged<ErrorReportObject> =>
  E.chain(
    (errorReport: ErrorReportObject): Merged<ErrorReportObject> => {
      const existingChildErrorReport = errorReport[key]

      if (typeof childErrorReport == 'string') {
        if (existingChildErrorReport !== undefined) {
          return E.left(`${key} is already defined`)
        }

        errorReport[key] = childErrorReport
        return E.right(errorReport)
      } else {
        if (existingChildErrorReport === undefined) {
          return E.left(`${key} is already defined`)
        } else if (typeof existingChildErrorReport === 'string') {
          errorReport[key] = childErrorReport
          return E.right(errorReport)
        } else {
          const merged = mergeErrorReports(existingChildErrorReport, childErrorReport)

          return E.bimap<string, string, ErrorReportObject, ErrorReportObject>(
            (error) => `${key}.${error}`,
            (merged) => {
              errorReport[key] = merged
              return errorReport
            }
          )(merged)
        }
      }
    }
  )(errorReportResult)

export const mergeErrorReports = (first: ErrorReportObject, second: ErrorReportObject): Merged<ErrorReportObject> =>
  R.reduceRightWithIndex(E.right(first), mergeAtKey)(second)
