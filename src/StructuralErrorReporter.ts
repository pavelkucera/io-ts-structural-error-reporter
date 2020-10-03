import { pipe } from 'fp-ts/lib/pipeable'
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'
import { mergeDifferentErrorReports } from './ErrorReport'
import * as E from 'fp-ts/lib/Either'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as t from 'io-ts'
import { isNonEmptyArray } from './ReadonlyArray'
import { ErrorReport, Errors, InternalError, Report } from './Types'
import { panic } from './Error'
import { Reporter } from 'io-ts/lib/Reporter'

type ErrorContext = ReadonlyNonEmptyArray<t.ContextEntry>
type ValidationError = t.ValidationError & { context: ErrorContext }

/**
 * Composes error message reported for a specific validation failure. Uses
 * default message if given, otherwise it creates a message based on the
 * error context.
 *
 * @param defaultMessage
 * @param context
 */
const composeErrorMessage = (defaultMessage: string | undefined, context: ErrorContext): string =>
  defaultMessage !== undefined ? defaultMessage : `Expecting "${RNEA.last(context).type.name}".`

/**
 * Builds an error report object for one validation failure based on the given
 * error message and context. Creates nested children as necessary.
 *
 * @param context
 * @param message
 */
const buildErrorReportObject = (context: ErrorContext, message: string): ErrorReport =>
  pipe(
    context,
    RNEA.reduceRight(
      message,
      (contextEntry: t.ContextEntry, childReport: ErrorReport): ErrorReport => ({
        [contextEntry.key]: childReport,
      })
    )
  )

/**
 * Creates a full-path error object for a validation error. Full-path means
 * that for record-codecs, the errors will be wrapped in a record with a single
 * property with an empty name: { '': ... } as io-ts adds a "root" context
 * entry to the error context.
 *
 * @param error
 */
const createFullSingleErrorReport = (error: ValidationError): ErrorReport => {
  const errorMessage = composeErrorMessage(error.message, error.context)
  return buildErrorReportObject(error.context, errorMessage)
}

const isValidationError = (validationError: t.ValidationError): validationError is ValidationError =>
  isNonEmptyArray(validationError.context)

const parseValidationError = (error: t.ValidationError): E.Either<InternalError, ValidationError> =>
  isValidationError(error)
    ? E.right(error)
    : panic(Errors.EmptyErrorContext, 'Error contains empty error context.')

/**
 * Creates an error report which is either a string or a record of error
 * reports. It does not contain the root object.
 *
 * @param error
 */
const createSingleErrorReport = (error: t.ValidationError): Report =>
  pipe(
    error,
    parseValidationError,
    E.map(createFullSingleErrorReport),
    E.fold(
      error => E.left(error),
      (fullErrorReport): Report => {
        if (typeof fullErrorReport === 'string') {
          return E.right(fullErrorReport)
        }

        return Object.keys(fullErrorReport).length !== 1 || !fullErrorReport.hasOwnProperty('')
          ? panic(Errors.UnexpectedErrorReportShape, 'Root record error report should only contain property "" (empty string).')
          : E.right(fullErrorReport[''])
      }
    )
  )

/**
 * Merges two reports, taking care of propagating nested internal errors.
 *
 * @param first
 * @param second
 */
const mergeReports = (first: Report, second: Report): Report =>
  // I miss monads.
  pipe(
    first,
    E.fold<InternalError, ErrorReport, Report>(
      error1 => pipe(
        second,
        E.fold<InternalError, ErrorReport, Report>(
          // Two internal errors happened at once.
          error2 => panic(Errors.MultipleFailures, 'Multiple internal errors appeared at once.', [error1, error2]),

          // Only first report contains an internal error.
          _ => E.left(error1)
        )
      ),
      result1 => pipe(
        second,
        E.fold<InternalError, ErrorReport, Report>(
          // Only second report contains an internal error.
          error2 => E.left(error2),

          // No internal error occurred.
          result2 => mergeDifferentErrorReports(result1, result2),
        )
      )
    )
  )


/**
 * Creates a full error report for a list of validation errors.
 *
 * @param errors
 */
export const createErrorReport = (errors: t.Errors): Report => {
  if (!isNonEmptyArray(errors)) {
    return panic(Errors.EmptyErrorList, 'Cannot build error report from an empty error list.');
  }

  return pipe(
    errors,
    RNEA.map(createSingleErrorReport),
    RNEA.fold({
      concat: mergeReports,
    })
  )
}

export const StructuralErrorReporter: Reporter<Report> = {
  report: E.fold(
    createErrorReport,
    // This might be a confusing error. However, the reporter should be used
    // only if the result is invalid and hence the error.
    () => panic(Errors.ResultIsValid, 'Result is valid, there are no errors to report.')
  )
}
