import { decons } from '../src/ReadonlyArray'
import { isNone, none, some } from 'fp-ts/lib/Option'

describe('ReadonlyArray', () => {
  describe('decons', () => {
    it('returns none for an empty array', () => {
      const result = decons([])
      expect(result).toBe(none)
    })

    it('returns head and an empty tail for a singleton', () => {
      const result = decons([42])
      expect(result).toStrictEqual(some([42, []]))
    })

    it('returns head and tail', () => {
      const result = decons([42, 314, 31415])
      expect(result).toStrictEqual(some([42, [314, 31415]]))
    })
  })
})
