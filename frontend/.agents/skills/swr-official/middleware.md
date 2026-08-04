---
name: swr-middleware
description: SWR middleware system — creating custom middleware for logging, persistence, dependent logic, or performance. Use when wrapping useSWR with reusable behaviors across hooks.
title: Middleware
type: guide
summary: Custom middleware for useSWR.
prerequisites:
  - /docs/data-fetching
related:
  - /docs/api
---

# Middleware

Middleware is a way to compose `useSWR` with custom behaviors. This allows you to easily reuse your own logic across SWR hooks.

## How It Works

Middleware is a function that takes a `useSWR` hook and returns a new hook with the custom logic applied.

```js
function myMiddleware (useSWRNext) {
  return (key, fetcher, config) => {
    // custom logic goes here
    const swr = useSWRNext(key, fetcher, config)
    return swr
  }
}
```

You can apply middleware through the `use` option in SWRConfig:

```jsx
<SWRConfig value={{ use: [myMiddleware] }}>
  <App/>
</SWRConfig>
```

You can also set it locally on a specific hook.

## Examples

### Logging Middleware

```js
function logger (useSWRNext) {
  return (key, fetcher, config) => {
    const extendedFetcher = (...args) => {
      console.log('SWR Request:', key)
      return fetcher(...args)
    }
    const swr = useSWRNext(key, extendedFetcher, config)
    return swr
  }
}
```

### Persistence Middleware

You can use middleware to persist the data of a hook to `localStorage` or `sessionStorage`:

```js
function localStorageMiddleware (useSWRNext) {
  return (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config)
    return swr
  }
}
```

### Dependent Middleware

You can also use middleware to implement dependent fetching, where a hook depends on the data of another hook.

## Order of Middleware

Middleware is applied in the order they are listed in the `use` array. The first middleware will wrap the second, and so on. So the order matters for the behavior.
