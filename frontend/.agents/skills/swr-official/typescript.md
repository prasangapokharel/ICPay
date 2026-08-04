---
name: swr-typescript
description: SWR TypeScript usage — generics for useSWR, useSWRInfinite, mutating data with optimistic UI types. Use when writing typed SWR hooks or typed mutation responses.
title: TypeScript
type: guide
summary: TypeScript support for SWR.
prerequisites:
  - /docs/data-fetching
related:
  - /docs/api
---

# TypeScript

SWR provides full TypeScript support. You can type the data returned by SWR, and the errors thrown by the fetcher.

## Data Typing

You can use the generic `useSWR` type to specify the data type:

```ts
interface User {
  id: number
  name: string
}

const { data } = useSWR<User>('/api/user', fetcher)
// data: User | undefined
```

The `data` will be `undefined` when it's not loaded yet. You can also use the `useSWR` generic type to specify the error type:

```ts
const { error } = useSWR<User, Error>('/api/user', fetcher)
// error: Error | undefined
```

## Common Types

SWR provides several common types in its type definitions, including `Fetcher`, `Key`, `SWRConfiguration`, `SWRResponse`, `SWRHook`, `SWROptions`, `SWRConfig`, `Cache` etc.

```ts
import { Fetcher, Key, SWRConfiguration } from 'swr'

// A fetcher that returns a `User` data type
const fetcher: Fetcher<User> = (url: string) => fetch(url).then(res => res.json())
```

## Mutation Types

The `mutate` API also supports generics. The mutation can return the new data type, or `undefined` to keep the old data:

```ts
// mutate returns a promise
const updatedUser = await mutate<User>(
  '/api/user',
  (data) => ({ ...data, name: 'new name' }),
  { optimisticData: (data) => ({ ...data, name: 'optimistic' }) }
)
```

## TypeScript in `useSWRInfinite`

The `useSWRInfinite` hook also provides TypeScript support. The `getKey` and `fetcher` functions are typed:

```ts
const { data } = useSWRInfinite(
  (index, previousPageData) => `/api/data?page=${index}`,
  fetcher
)
// data: PageData[] | undefined
```
