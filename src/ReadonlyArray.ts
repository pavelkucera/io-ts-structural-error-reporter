import { pipe } from 'fp-ts/lib/pipeable'
import { tail } from 'fp-ts/lib/ReadonlyArray'
import { map, Option } from 'fp-ts/lib/Option'

export const decons = <A>(as: ReadonlyArray<A>): Option<[A, ReadonlyArray<A>]> =>
  pipe(
    tail(as),
    map<ReadonlyArray<A>, [A, ReadonlyArray<A>]>(
      // Tail exists => as is not an empty array
      // => accessing as[0] is fine
      // could be rewritten using a more imperative approach
      (bs) => [as[0], bs]
    )
  )
