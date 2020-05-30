import { buildErrorReportObject } from '../src/StructuralErrorReporter'
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
})
