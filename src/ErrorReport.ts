import { Either } from 'fp-ts/lib/Either'
import { ErrorReport, ErrorReportRecord, Errors, InternalError } from './Types'
import { panic } from './Error'
import * as E from 'fp-ts/lib/Either'
import * as R from 'fp-ts/lib/Record'
import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/pipeable'

type Merged<A extends ErrorReportRecord> = Either<InternalError, A>

export const mergeAtKey = (
  key: string,
  errorReportResult: Merged<ErrorReportRecord>,
  childErrorReport: ErrorReport
): Merged<ErrorReportRecord> =>
  pipe(
    errorReportResult,
    E.chain(
      (errorReport: ErrorReportRecord): Merged<ErrorReportRecord> => {
        const existingChildErrorReport = errorReport[key]

        if (typeof childErrorReport == 'string') {
          if (existingChildErrorReport !== undefined) {
            return panic(Errors.DuplicateErrorReportKey, `Multiple error reports exist for key "${key}".`)
          }

          errorReport[key] = childErrorReport
          return E.right(errorReport)

        } else {
          if (typeof existingChildErrorReport === 'string') {
            return panic(Errors.IncompatibleErrorReportTypes, `Incompatible types at key "${key}": ${typeof existingChildErrorReport}, ${typeof errorReport}.`)

          } else if (existingChildErrorReport === undefined) {
            errorReport[key] = childErrorReport
            return E.right(errorReport)

          } else {
            return pipe(
              mergeDifferentErrorReports(existingChildErrorReport, childErrorReport),
              E.bimap<InternalError, InternalError, ErrorReportRecord, ErrorReportRecord>(
                t.identity,
                (merged) => {
                  errorReport[key] = merged
                  return errorReport
                }
              )
            )
          }
        }
      }
    )
  )

/**
 * Merges two error reports. The two error reports must report on different
 * keys in records.
 *
 * @param first
 * @param second
 */
export const mergeDifferentErrorReports = (first: ErrorReport, second: ErrorReport): Merged<ErrorReportRecord> => {
  if (typeof first === 'string' && typeof second === 'string') {
    return panic(Errors.MultipleStringErrorReports, 'Cannot merge two string errors.')
  }

  if (typeof first !== 'object' || typeof second !== 'object') {
    return panic(Errors.IncompatibleErrorReportTypes, `Incompatible types: ${typeof first}, ${typeof second}`)
  }

  return R.reduceWithIndex(
    E.right(first),
    mergeAtKey
  )(second)
}
