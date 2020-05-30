import * as E from 'fp-ts/lib/Either';
import * as R from 'fp-ts/lib/Record';
import {Either} from 'fp-ts/lib/Either';

export type ErrorReportObject = {
  [key: string]: ErrorReport
}

export type ErrorReport =
  | string
  | ErrorReportObject

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
