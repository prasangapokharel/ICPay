---
name: swr-cache
description: SWR caching internals — cache provider, createCache, storage, and server-side considerations. Use when customizing the cache layer or persisting cache to storage.
title: Cache
type: guide
summary: Cache configuration and providers.
prerequisites:
  - /docs/data-fetching
related:
  - /docs/api
  - /docs/prefetching
---

# Cache

SWR has a cache to store the data for the hooks. By default, the cache is an in-memory `Map`. You can customize it with a cache provider.

## Custom Cache Provider

You can pass a `provider` function to `SWRConfig` to customize the cache:

```jsx
<SWRConfig value={{ provider: () => new Map() }}>
  <App/>
</SWRConfig>
```

The provider returns a cache instance that has the `get`, `set`, `delete` methods. This lets you create a cache that stores data in `localStorage` or other persistent storage.

## The Cache Interface

A cache instance must implement the following interface:

```ts
interface Cache<Data = any> {
  get(key: string): Data | undefined
  set(key: string, value: Data): void
  delete(key: string): void
}
```

## Server Side Rendering

During SSR, the cache is not shared between the server and the client. The cache is created on the client side. If you want to share data between the server and the client, you can use the `fallback` option instead.

## Shared Cache

If you want to share the cache between multiple tabs or windows, you can implement a provider that uses `localStorage` or the BroadcastChannel API.
