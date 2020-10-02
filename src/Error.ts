import { InternalError } from './Types'
import { Either } from 'fp-ts/lib/Either'
import * as E from 'fp-ts/lib/Either'

export const panic = <T>(type: symbol, message: string, previous: InternalError[] = []): Either<InternalError, T> =>
  E.left({
    type: type,
    message: message,
    previous: previous,
  })
