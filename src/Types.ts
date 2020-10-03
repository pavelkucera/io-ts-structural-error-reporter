import { Either } from 'fp-ts/lib/Either'

export type ErrorReportRecord = {
  [key: string]: ErrorReport
}

export type ErrorReport =
  | string
  | ErrorReportRecord

export type Report = Either<InternalError, ErrorReport>

export type InternalError = {
  type: symbol
  message: string
  previous: InternalError[]
}

export const Errors = {
  DuplicateErrorReportKey: Symbol('Duplicate error report key'),
  EmptyErrorContext: Symbol('Empty error context'),
  EmptyErrorList: Symbol('Empty error list'),
  IncompatibleErrorReportTypes: Symbol('Incompatible error report types'),
  MultipleFailures: Symbol('Multiple failures'),
  MultipleStringErrorReports: Symbol('Multiple string error reports'),
  UnexpectedErrorReportShape: Symbol('Unexpected error report shape'),
  ResultIsValid: Symbol('Result is valid'),
}
