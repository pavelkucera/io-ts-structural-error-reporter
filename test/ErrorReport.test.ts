import { mergeErrorReports } from '../src/ErrorReport'
import { Errors } from '../src/Types'
import { expectLeft, expectRight } from './Expect'

describe('mergeErrorReports', () => {
  it('Fails when error reports contain multiple errors for the same key', () => {
    const errorReport = mergeErrorReports({ key: 'error1' }, { key: 'error2' })

    expectLeft(
      {
        type: Errors.DuplicateKey,
        message: expect.any(String),
      },
      errorReport
    )
  })

  it('Fails when error reports contain multiple errors for the same nested key', () => {
    const errorReport = mergeErrorReports({ level0: { level1: 'error1' } }, { level0: { level1: 'error2' } })

    expectLeft(
      {
        type: Errors.DuplicateKey,
        message: expect.any(String),
      },
      errorReport
    )
  })

  it('Merges two error reports', () => {
    const errorReport = mergeErrorReports(
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
