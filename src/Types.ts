import { Either } from 'fp-ts/lib/Either'

export type ErrorReportObject = {
  [key: string]: ErrorReport
}

export type ErrorReport =
  | string
  | ErrorReportObject

export type Report = Either<InternalError, ErrorReport>

export type InternalError = {
  type: symbol
  message: string
}

export const Errors = {
  DuplicateKey: Symbol('Duplicate key'),
  EmptyErrorContext: Symbol('Empty error context'),
  EmptyErrorList: Symbol('Empty error list'),
  IncompatibleErrorReports: Symbol('Incompatible error reports'),
  MultipleErrors: Symbol('Multiple errors'),
  StringErrorReports: Symbol('String error reports'),
  ValidResult: Symbol('Valid result'),
}
