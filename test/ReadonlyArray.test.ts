import { isNonEmptyArray } from '../src/ReadonlyArray'

describe('isNonEmptyArray', () => {
  it('Returns false for an empty array', () => {
    const result = isNonEmptyArray([])
    expect(result).toBe(false)
  })

  it('Returns true for an array of size 1', () => {
    const result = isNonEmptyArray([42])
    expect(result).toBe(true)
  })
})
