import { InternalError } from './Types'
import { Either } from 'fp-ts/lib/Either'
import * as E from 'fp-ts/lib/Either'

export const internalError = <T>(type: symbol, message: string): Either<InternalError, T> =>
  E.left({
    type: type,
    message: message,
  })
