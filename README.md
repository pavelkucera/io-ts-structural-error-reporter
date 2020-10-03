# Structural `io-ts` Error Reporter

Library to give you structural error reports from validation errors created by
 [`io-ts`](https://github.com/gcanti/io-ts).
The library is motivated by a desire to use `io-ts` to validate a REST API's JSON input and return errors in an approachable format.

# Installation

```shell script
npm install --save-exact @pavelkucera/io-ts-structural-error-reporter
```

# Usage

Use `StructuralErrorReporter.report` to convert result of `Type.decode` into errors copying the underlying `Type` structure.
The type of the report function is:
```typescript
import { Either } from 'fp-ts/lib/Either'
import * as t from 'io-ts'

type Reporter = (validation: t.Validation<any>) => Either<InternalError, ErrorReport>

type ErrorReportRecord = {
  [key: string]: ErrorReport
}

type ErrorReport =
  | string
  | ErrorReportRecord
```

The reporter is designed not to throw any errors during runtime, which is why the return value is of type `Either`.
In general, an error/Left result means that a "this should never happen" error happened in library or on the boundary between the library and `io-ts`.
In such a case, the only course of action should be aborting (and reporting an issue).

The reporter is supposed to run only when a validation fails, and thus the reporter *reports an error when validation succeeds*. 
Now on to the example that you are waiting for!

## Example 

```typescript
import { InternalError, StructuralErrorReporter } from '@pavelkucera/io-ts-structural-error-reporter'
import * as Either from 'fp-ts/lib/Either'
import * as t from 'io-ts'

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

// Use some of the Either functionality to unwrap the result.
const structrualErrorReport = Either.getOrElse<InternalError, ErrorReport>(
  _error => { throw new Error('Panic') }
)(errorReport)

console.log(structrualErrorReport);
// prints:
// {
//   string: 'Expecting "string".',
//   nested: {
//     property: 'Expecting "string".',
//   },
// }
```
