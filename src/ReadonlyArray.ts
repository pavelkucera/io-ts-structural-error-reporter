import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray'

export const isNonEmptyArray = <T>(context: ReadonlyArray<T>): context is ReadonlyNonEmptyArray<T> =>
  context.length !== 0
