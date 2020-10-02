import { expectLeft, expectRight } from './Expect'
import { Errors } from '../src/Types'
import { StructuralErrorReporter } from '../src'
import * as E from 'fp-ts/lib/Either'
import * as t from 'io-ts'

describe('StructuralErrorReporter', () => {
  describe('Assumption mismatch', () => {
    it('Fails for a valid result', () => {
      const result = StructuralErrorReporter.report(t.string.decode('42'))

      expectLeft(
        {
          type: Errors.ResultIsValid,
        },
        result
      )
    })

    it('Fails for an empty error list', () => {
      const result = StructuralErrorReporter.report(E.left([]))

      expectLeft(
        {
          type: Errors.EmptyErrorList,
        },
        result
      )
    })

    it('Fails for an empty error context', () => {
      const errors: t.Errors = [
        {
          context: [],
          message: undefined,
          value: undefined,
        },
      ]

      const result = StructuralErrorReporter.report(E.left(errors))

      expectLeft(
        {
          type: Errors.EmptyErrorContext,
        },
        result
      )
    })

    it('Fails when two errors refer to the same field', () => {
      const error: t.ValidationError = {
        message: undefined,
        value: undefined,
        context: [
          {
            actual: {key: undefined},
            type: t.type({key: t.string}),
            key: '',
          },
          {
            actual: undefined,
            type: t.string,
            key: 'key',
          },
        ],
      }

      const errors: t.Errors = [error, error]
      const result = StructuralErrorReporter.report(E.left(errors))

      expectLeft(
        {
          type: Errors.DuplicateErrorReportKey,
        },
        result
      )
    })
  })

  it('Creates error report for non-record codecs', () => {
    expectRight('Expecting "string".', StructuralErrorReporter.report(t.string.decode(42)))
    expectRight('Expecting "Array<number>".', StructuralErrorReporter.report(t.array(t.number).decode(42)))
  })

  it('Creates error report for record codecs', () => {
    const record = t.type({
      string: t.string,
      number: t.number,
      list: t.array(t.string),
      deep: t.type({
        deeper: t.string,
      }),
    })

    const validationResult = record.decode({
      string: 'valid',
      number: 'invalid',
      list: [42],
      deep: {
        deeper: 22,
      },
    })

    const errorReport = StructuralErrorReporter.report(validationResult)
    expectRight(
      {
        number: 'Expecting "number".',
        list: {
          '0': 'Expecting "string".',
        },
        deep: {
          deeper: 'Expecting "string".',
        },
      },
      errorReport
    )
  })
})
