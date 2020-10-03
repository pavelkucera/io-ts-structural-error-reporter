import { StructuralErrorReporter } from '../src'
import * as Either from 'fp-ts/lib/Either'
import * as t from 'io-ts'
import { ErrorReport, InternalError } from '../src/Types'

describe('Example', () => {
  it('Reports errors as expected', () => {
    const type = t.type({
      string: t.string,
      nested: t.type({
        property: t.string,
      })
    })

    const decodedValue = type.decode({
      string: 42, // should be string
      nested: {
        property: 42, // should be string
      }
    });

    const errorReport = StructuralErrorReporter.report(decodedValue);

    const structuralErrorReport = Either.getOrElse<InternalError, ErrorReport>(
      _error => { throw new Error('Panic') }
    )(errorReport)

    expect(structuralErrorReport).toMatchObject({
      string: 'Expecting "string".',
      nested: {
        property: 'Expecting "string".',
      },
    });
  })
})
