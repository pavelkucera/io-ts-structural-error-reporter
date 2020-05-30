import * as E from 'fp-ts/lib/Either'

export const expectLeft = (expected: unknown, actual: unknown): void => expect(actual).toMatchObject(E.left(expected))

export const expectRight = (expected: unknown, actual: unknown): void => expect(actual).toMatchObject(E.right(expected))
