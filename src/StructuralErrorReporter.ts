import { pipe } from 'fp-ts/lib/pipeable'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'
import { mergeErrorReports } from './ErrorReport'
import * as E from 'fp-ts/lib/Either'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as t from 'io-ts'
import { Reporter } from 'io-ts/lib/Reporter'
import { isNonEmptyArray } from './ReadonlyArray'
import { ErrorReport, Errors, InternalError, Report } from './Types'
import { internalError } from './Error'

type ErrorContext = ReadonlyNonEmptyArray<t.ContextEntry>

const composeErrorMessage = (defaultMessage: string | undefined, context: ErrorContext): string =>
  defaultMessage !== undefined ? defaultMessage : `Expecting "${RNEA.last(context).type.name}".`

const buildErrorReportObject = (message: string, context: ErrorContext): ErrorReport =>
  pipe(
    context,
    RNEA.reduceRight(
      message,
      (contextEntry: t.ContextEntry, childReport: ErrorReport): ErrorReport => ({
        [contextEntry.key]: childReport,
      })
    )
  )

const createSingleErrorReport = (error: t.ValidationError): Report => {
  if (!isNonEmptyArray(error.context)) {
    return internalError(Errors.EmptyErrorContext, 'Empty error context')
  }

  const errorMessage = composeErrorMessage(error.message, error.context)

  const errorReport = buildErrorReportObject(errorMessage, error.context)
  return E.right(errorReport)
}

export const createErrorReport = (errors: t.Errors): Report => {
  if (!isNonEmptyArray(errors)) {
    return internalError(Errors.EmptyErrorList, 'Empty error list')
  }

  return RNEA.foldMap({
    concat: (first: Report, second: Report): Report =>
      E.fold(
        (error1: InternalError) =>
          E.fold(
            (error2: InternalError) =>
              internalError<ErrorReport>(Errors.MultipleErrors, `Multiple: ${error1}, ${error2}`),
            () => E.left(error1)
          )(second),
        (errorReport1: ErrorReport) =>
          E.fold(
            (error2: InternalError) => E.left(error2),
            (errorReport2: ErrorReport) => mergeErrorReports(errorReport1, errorReport2)
          )(second)
      )(first),
  })(createSingleErrorReport)(errors)
}

const reportFailure = (errors: t.Errors): Report =>
  createErrorReport(errors)

const reportSuccess = (): Report =>
  internalError(Errors.ValidResult, 'No errors')

export const StructuralErrorReporter: Reporter<Report> = {
  report: E.fold(reportFailure, reportSuccess),
}
