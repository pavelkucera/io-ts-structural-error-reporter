import { panic } from '../src/Error'
import { expectLeft } from './Expect'

describe('Error', () => {
  describe('panic', () => {
    const errorSymbol = Symbol()

    it('Creates an internal error', () => {
      const error = panic(errorSymbol, 'message', [])

      expectLeft(
        {
          type: errorSymbol,
          message: 'message',
          previous: [],
        },
        error
      )
    })
  })
})
