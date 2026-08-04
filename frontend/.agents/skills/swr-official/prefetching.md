---
name: swr-prefetching
description: SWR data prefetching — preloading data before render using fallback data, preload function, or nested fetch with mutate. Use when you want data available before a page/component renders.
title: Prefetching Data
type: guide
summary: Preload data before rendering.
prerequisites:
  - /docs/data-fetching
related:
  - /docs/cache
  - /docs/mutation
---

# Prefetching Data

SWR returns cached data first, then sends the request. We can use this feature to preload the data of pages that are very likely to be visited by the user. This way, when the user visits the page, the data is already in the cache.

To preload resources in a page, you can render a `<link rel="preload" />` in the `<head>`, or use `preload` API. But for data, there are several approaches:

## Preload Data with the `preload` API

Use the `preload` API to start requesting data before the page is rendered. This will be cached and sent to the page when it renders.

```jsx
import useSWR, { preload } from 'swr'

// The preload function will start the request
preload('/api/user', fetcher)

function Profile () {
  // The request is already started, so the data is cached
  const { data } = useSWR('/api/user', fetcher)
  return <div>{data.name}</div>
}
```

This works on both the server and the client side. You can use it in the `head`, a component's `render`, or a module's top-level. In Next.js, you can also use it in the `getServerSideProps` or `getStaticProps` functions.

## Preload Data with the `fallbackData` Option

You can also set the `fallbackData` of a hook to preload the data:

```jsx
const { data } = useSWR('/api/user', fetcher, { fallbackData: preloadedData })
```

## Preload Data with the `fallback` Option

If you want to preload multiple resources, you can set the `fallback` option in the `<SWRConfig>`:

```jsx
<SWRConfig value={{
  fallback: {
    '/api/user': preloadedData,
    '/api/items': preloadedItems
  }
}}>
  <Profile/>
</SWRConfig>
```

The data will be returned from the cache if the key matches, and also be written into the cache. Note that the fallback values need to be serialized when using SSR.

## Preload Data with the Nested Fetcher

Sometimes, you might want to fetch the data of the current page based on the data of another page. You can use the "nested" fetcher to combine the two fetches into one request:

```js
function App () {
  const { data: user } = useSWR('/api/user', fetcher)
  const { data: projects } = useSWR('/api/user?uid=' + user.id, fetcher)

  // When passing a function, SWR will use the return value
  // as `key`. If the function throws or returns falsy,
  // SWR will know that some dependencies are not ready.
  // In this case `user.id` throws when `user` isn't loaded.
  const { data: projects } = useSWR(
    () => '/api/user?uid=' + user.id,
    fetcher
  )
}
```

## Preload Data with the `useSWR` + `mutate` API

You can also use the `mutate` API to preload data, which is useful when you want to prefetch data and write it to the cache:

```js
import useSWR, { useSWRConfig } from 'swr'

function App () {
  const { mutate } = useSWRConfig()
  const { data } = useSWR('/api/user', fetcher)

  return (
    <div>
      <h1>My name is {data.name}.</h1>
      <button onClick={async () => {
        const newName = data.name.toUpperCase()
        // update the local data immediately, but disable the revalidation
        await mutate('/api/user', { ...data, name: newName }, { revalidate: false })
        // send a request to the API to update the source
        await requestUpdateUsername(newName)
        // trigger a revalidation (refetch) to make sure our local data is correct
        mutate('/api/user')
      }}>Uppercase my name!</button>
    </div>
  )
}
```
