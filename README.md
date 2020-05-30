# Warning

At this stage, this is still an **experimental**, incomplete project. As such, it is not on NPM.

# Aim 

Transform validation errors from [`io-ts`](https://www.npmjs.com/package/io-ts) to structurally represent the underlying types.
Example:
```typescript
import * as t from 'io-ts'
import { StructuralErrorReporter } from '@pavelkucera/io-ts-structural-error-reporter'

const type = t.type({
  string: 'string',
  nested: t.type({
    property: t.string,
  })
})
const errors = StructuralErrorReporter.report(type.decode({
  string: '42',
  nested: {
    property: 42
  }
}))

// errors should correspond to the following object
const expectedErrors = {
  nested: {
    property: 'Expecting "string".'
  }
}
```

Having such reporter makes it easy to use `io-ts` in REST APIs.
