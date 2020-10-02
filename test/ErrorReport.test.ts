import { mergeDifferentErrorReports } from '../src/ErrorReport'
import { Errors } from '../src/Types'
import { expectLeft, expectRight } from './Expect'

describe('mergeErrorReports', () => {
  it('Fails when error reports contain multiple errors for the same key', () => {
    const errorReport = mergeDifferentErrorReports({ keyName: 'error1' }, { keyName: 'error2' })

    expectLeft(
      {
        type: Errors.DuplicateErrorReportKey,
        message: expect.any(String),
      },
      errorReport
    )
  })

  it('Fails when error reports contain multiple errors for the same nested key', () => {
    const errorReport = mergeDifferentErrorReports({ level0: { level1: 'error1' } }, { level0: { level1: 'error2' } })

    expectLeft(
      {
        type: Errors.DuplicateErrorReportKey,
        message: expect.any(String),
      },
      errorReport
    )
  })

  it('Fails when error reports are of different types for the same nested key', () => {
    const errorReport = mergeDifferentErrorReports({ level0: { level1: 'string error' } }, { level0: { level1: {} } })

    expectLeft(
      {
        type: Errors.IncompatibleErrorReportTypes,
        message: expect.any(String),
      },
      errorReport
    )
  })

  it('Fails when both error reports strings', () => {
    const errorReport = mergeDifferentErrorReports('first', 'second')

    expectLeft(
      {
        type: Errors.MultipleStringErrorReports,
        message: expect.any(String),
      },
      errorReport
    )
  })

  it('Merges two error reports', () => {
    const errorReport = mergeDifferentErrorReports(
      {
        key1: 'error1',
        some: {
          '1': 'nested1',
        },
      },
      {
        key2: 'error2',
        some: {
          '0': 'nested0',
        },
      }
    )

    expectRight(
      {
        key1: 'error1',
        key2: 'error2',
        some: {
          '0': 'nested0',
          '1': 'nested1',
        },
      },
      errorReport
    )
  })
})
