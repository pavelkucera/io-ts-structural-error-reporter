import { buildErrorReportObject, mergeErrorReports } from '../src/StructuralErrorReporter'
import * as E from 'fp-ts/lib/Either'
import * as t from 'io-ts'

describe('StructuralErrorReporter', () => {
  describe('buildErrorReportObject', () => {
    it('Uses given error message', () => {
      const errorReport = buildErrorReportObject('error message', [
        {
          key: 'key',
          type: t.string,
          actual: 42
        }
      ])

      expect(errorReport).toMatchObject({
        key: 'error message'
      })
    })

    it('Returns nested structure for a nested error', () => {
      const type = t.type({
        nested: t.type({
          list: t.array(t.string)
        })
      })
      const actual = {
        nested: {
          list: ['42', 42]
        }
      }

      const errorReport = buildErrorReportObject('error message', [
        {
          key: '',
          type: type,
          actual: actual
        },
        {
          key: 'nested',
          type: type.props.nested,
          actual: actual.nested
        },
        {
          key: 'list',
          type: type.props.nested.props.list,
          actual: actual.nested.list
        },
        {
          key: '1',
          type: type.props.nested.props.list.type,
          actual: actual.nested.list[1]
        }
      ])

      expect(errorReport).toMatchObject({
        '': {
          nested: {
            list: {
              '1': 'error message'
            }
          }
        }
      })
    })
  })

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
