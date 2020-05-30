import { Either } from 'fp-ts/lib/Either'
import { ErrorReport, ErrorReportObject, Errors, InternalError } from './Types'
import { internalError } from './Error'
import * as E from 'fp-ts/lib/Either'
import * as R from 'fp-ts/lib/Record'

type Merged<A extends ErrorReportObject> = Either<InternalError, A>

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
          return internalError(Errors.DuplicateKey, key)
        }

        errorReport[key] = childErrorReport
        return E.right(errorReport)

      } else {
        if (typeof existingChildErrorReport === 'string') {
          return internalError(Errors.IncompatibleErrorReports, key)

        } else if (existingChildErrorReport === undefined) {
          errorReport[key] = childErrorReport
          return E.right(errorReport)

        } else {
          const merged = mergeErrorReports(existingChildErrorReport, childErrorReport)

          return E.bimap<InternalError, InternalError, ErrorReportObject, ErrorReportObject>(
            (error) => ({ type: error.type, message: `${key}: ${error.message}` }),
            (merged) => {
              errorReport[key] = merged
              return errorReport
            }
          )(merged)
        }
      }
    }
  )(errorReportResult)

export const mergeErrorReports = (first: ErrorReport, second: ErrorReport): Merged<ErrorReportObject> => {
  if (typeof first === 'string' && typeof second === 'string') {
    return internalError(Errors.StringErrorReports, 'Cannot merge two string errors')
  }

  if (typeof first !== 'object' || typeof second !== 'object') {
    return internalError(Errors.IncompatibleErrorReports, `Incompatible types: ${typeof first}, ${typeof second}`)
  }

  return R.reduceRightWithIndex(E.right(first), mergeAtKey)(second)
}
