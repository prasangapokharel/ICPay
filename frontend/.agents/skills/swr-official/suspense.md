---
name: swr-suspense
description: SWR with React Suspense — enable suspense mode, streaming, preloading, and fallback rendering. Use when building loading states with Suspense boundaries instead of isLoading checks.
title: Suspense
type: guide
summary: SWR with React Suspense.
prerequisites:
  - /docs/data-fetching
related:
  - /docs/api
---

# Suspense

You can use SWR with React's Suspense by setting the `suspense` option to `true`.

```jsx
import { Suspense } from 'react'
import useSWR from 'swr'

function Profile () {
  const { data } = useSWR('/api/user', fetcher, { suspense: true })
  return <div>hello, {data.name}</div>
}

export default function App () {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <Profile/>
    </Suspense>
  )
}
```

This is a new experimental feature and the way to use it may change in the future. Make sure to update the version of `react` and `react-dom` to the latest one, and also the version of SWR to the latest one.

## Global Config

You can also enable suspense mode globally:

```jsx
<SWRConfig value={{ suspense: true }}>
  <Suspense fallback={<div>loading...</div>}>
    <Profile/>
  </Suspense>
</SWRConfig>
```

With suspense mode, the component will not render until the data is loaded. The `data` will be `undefined` until the request completes.

## Streaming

You can also use SWR with React's streaming SSR, which is supported by Next.js. In this case, the data will be streamed to the client. The `suspense` option will be automatically enabled when using streaming SSR.
