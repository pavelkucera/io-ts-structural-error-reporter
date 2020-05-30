import { mergeErrorReports } from '../src/ErrorReport'
import * as E from 'fp-ts/lib/Either'

describe('ErrorReporter', () => {
  describe('mergeErrorReports', () => {
    it('Fails when error reports contain multiple errors for the same key', () => {
      const errorReport = mergeErrorReports({ key: 'error1' }, { key: 'error2' })
      expect(errorReport).toMatchObject(E.left('key is already defined'))
    })

    it('Fails when error reports contain multiple errors for the same nested key', () => {
      const errorReport = mergeErrorReports({ level0: { level1: 'error1' } }, { level0: { level1: 'error2' } })
      expect(errorReport).toMatchObject(E.left('level0.level1 is already defined'))
    })

    it('Merges two objects', () => {
      const errorReport = mergeErrorReports(
        {
          key1: 'error1',
          some: {
            '1': 'nested1'
          }
        },
        {
          key2: 'error2',
          some: {
            '0': 'nested0'
          }
        }
      )

      expect(errorReport).toMatchObject(
        E.right({
          key1: 'error1',
          key2: 'error2',
          some: {
            '0': 'nested0',
            '1': 'nested1'
          }
        })
      )
    })
  })
})
