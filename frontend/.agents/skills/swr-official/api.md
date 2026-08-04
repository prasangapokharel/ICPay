---
name: swr-api
description: SWR API reference — options and return values for useSWR, useSWRConfig, useSWRImmutable, useSWRInfinite, mutation, and configuration provider. Use when writing SWR hooks or need option/return value details.
title: API
type: reference
summary: SWR API reference and return values.
prerequisites:
  - /docs/data-fetching
related:
  - /docs/typescript
---

# API

## Return Values

### `useSWR`

```js
const {
  data,
  error,
  isValidating,
  isLoading,
  mutate,
  boundMutate
} = useSWR(key, fetcher, options)
```

#### Parameters

- `key`: a unique identifier for the request (or a function / array / `null`) [(advanced usage)](/docs/arguments)
- `fetcher`: (optional) an async function for fetching data [(details)](/docs/data-fetching)
- `options`: (optional) an object of options for this SWR hook

#### Return Values

- `data`: data for the given key resolved by `fetcher` (or undefined if not loaded)
- `error`: error thrown by `fetcher` (or undefined)
- `isValidating`: if there is a request or revalidation loading
- `isLoading`: if there is the initial loading
- `mutate(data, options?)`: function to mutate the cached data for the given key
- `boundMutate`: same as `mutate` but bound to `key`

### `useSWRConfig`

```js
const { cache, mutate, fetcher, fallback } = useSWRConfig()
```

#### Return Values

- `cache`: the cache instance for the given SWR config
- `mutate`: global mutate function to mutate the cached data of all keys [(details)](/docs/mutation)
- `fetcher`: the fetcher function configured
- `fallback`: the global fallback data configured

### `useSWRImmutable`

```js
const { data, error } = useSWRImmutable(key, fetcher, options)
```

This is the same as `useSWR` but it will disable all automatic revalidations of the hook. No need to pass `revalidateIfStale`, `revalidateOnFocus` or `revalidateOnReconnect` options.

### `useSWRInfinite`

Get the pages of data for `getKey` [(details)](/docs/pagination).

```js
const {
  data,
  error,
  isLoading,
  isValidating,
  size,
  setSize,
  mutate
} = useSWRInfinite(getKey, fetcher, options)
```

#### Return Values

- `data`: an array of `fetcher` return values, for each page
- `error`: error thrown by `fetcher` (or undefined)
- `isLoading`: if there is the initial loading
- `isValidating`: if there is a request or revalidation loading
- `size`: the number of pages
- `setSize`: set the number of pages
- `mutate`: function to mutate the cached data for all pages

## Options

### `suspense`

- `type`: `boolean`
- `default`: `false`

Enable React Suspense mode. [(details)](/docs/suspense)

### `fetcher`

- `type`: `(key) => Promise<any> | any`

The fetcher function for this hook. It accepts any arguments (based on the `key`).

### `initialData`

- `type`: `any`

The initial data to be returned. The data will also be written into the cache. [(details)](/docs/prefetching)

### `revalidateOnMount`

- `type`: `boolean`
- `default`: `true` (for first render without data) / `false` (for subsequent renders)

Enable or disable revalidation when the component is first mounted.

### `revalidateIfStale`

- `type`: `boolean`
- `default`: `true`

Auto revalidate when the data is stale.

### `revalidateOnFocus`

- `type`: `boolean`
- `default`: `true`

Auto revalidate when the window gets focused.

### `revalidateOnReconnect`

- `type`: `boolean`
- `default`: `true`

Automatically revalidate when the browser regains a network connection (via `navigator.onLine`).

### `revalidateOnInterval`

- `type`: `boolean | number`
- `default`: `false`

Polling interval (in milliseconds). Disabled by default. It can be enabled by setting a value greater than `0`. The value `0` is the default value and will be considered as `false`. This is just a config in `useSWR`, and no extra effects. When the component unmounts or the window is hidden, this will be paused.

### `refreshInterval`

- `type`: `number`
- `default`: `0`

Polling interval (in milliseconds). Disabled by default. It can be enabled by setting a value greater than `0`. This is just a config in `useSWR`, and no extra effects. When the component unmounts or the window is hidden, this will be paused.

### `refreshWhenHidden`

- `type`: `boolean`
- `default`: `false`

Polling when the window is hidden. If `refreshInterval` is not defined, this is ignored.

### `refreshWhenOffline`

- `type`: `boolean`
- `default`: `false`

Polling when the browser is offline (determined by `navigator.onLine`). If `refreshInterval` is not defined, this is ignored.

### `dedupingInterval`

- `type`: `number`
- `default`: `2000`

Deduplicate requests with the same key in this time span.

### `focusThrottleInterval`

- `type`: `number`
- `default`: `5000`

Throttle revalidation triggered by focus events to avoid many requests in a short time.

### `loadingTimeout`

- `type`: `number`
- `default`: `3000`

Timeout to trigger the `onLoadingSlow` event.

### `errorRetryInterval`

- `type`: `number`
- `default`: `5000`

Error retry interval.

### `errorRetryCount`

- `type`: `number | undefined`
- `default`: `undefined`

Max error retry count.

### `shouldRetryOnError`

- `type`: `boolean`
- `default`: `true`

If `true`, this SWR hook will retry the request when encountering errors (including network errors).

### `keepPreviousData`

- `type`: `boolean`
- `default`: `false`

Keep the previous data when the key changes. The `data` value will be frozen with the `useMemo` hook. It will be reset to the initial data when revalidating.

### `revalidateOnFocus`, `revalidateOnReconnect`, `revalidateOnMount`, `revalidateIfStale`

- `type`: `boolean`

The revalidation strategy for this hook.

### `fallbackData`

- `type`: `any`

The data to be returned if the hook has not fetched any data yet. The data will also be written into the cache. [(details)](/docs/prefetching)

### `fallback`

- `type`: `Record<string, any>`

A map of keys to fallback data. It will be merged into the cache for any missing keys. [(details)](/docs/prefetching)

### `isPaused`

- `type`: `() => boolean`

A function to detect the paused state. When it returns `true`, all requests will be paused. It will also stop `revalidateOnFocus`, `revalidateOnReconnect` and `revalidateOnInterval` until it returns `false` again.

### `onLoadingSlow(key, config)`

A callback function triggered when a request takes too long to load (see `loadingTimeout`).

### `onSuccess(data, key, config)`

A callback function triggered when a request finishes successfully.

### `onError(err, key, config)`

A callback function triggered when a request returns an error.

### `onDiscarded(key)`

A callback function triggered when a request has been discarded.

### `compare(a, b)`

- `type`: `(a: any | undefined, b: any | undefined) => boolean`

Comparison function used to detect when data changes. Returns `false` by default.

### `isVisible`

- `type`: `() => boolean`

A function to detect whether the current window is visible.

### `isOnline`

- `type`: `() => boolean`

A function to detect whether the current network is online.

### `initFocus(callback)`

- `type`: `(callback: () => void) => void`

A function that registers the callback for window focus events. The callback is triggered when the window gets focused.

### `initReconnect(callback)`

- `type`: `(callback: () => void) => void`

A function that registers the callback for network reconnect events.

### `matchKey`

- `type`: `(key: Key, keyToMatch: Key) => boolean`

A function that determines if the given key matches the key to match. Used for the global `mutate`.

### `provider`

- `type`: `(cache: Cache) => Cache`

A function to configure the cache provider. It takes a cache instance as a parameter and returns a cache instance. [(details)](/docs/cache)

### `errorRetry`

- `type`: `(retryCount: number, config) => void`

A callback function triggered when an error occurs. It accepts a `retryCount` and the config. It will be called when an error occurs.

### `errorReset`

- `type`: `() => void`

A function that resets the error state. It will be called when an error occurs.

## The Configuration Provider

```js
<SWRConfig value={options}>
  <Component/>
</SWRConfig>
```

The `options` prop is a plain object with the same options as `useSWR`, and the SWR config will be shared across the entire component tree.

## Global Configuration

The global config is created when the module is imported.

```js
SWRConfig.default = {
  refreshInterval: 3000,
  fetcher: (...args) => fetch(...args).then(res => res.json())
}
```

## `mutate`

The `mutate` function can be used to update the cache data. It is also returned by the `useSWR` and `useSWRConfig` hooks.

```js
const { mutate } = useSWRConfig()
```

#### Parameters

- `key`: a unique identifier for the request (or a function / array / `null`)
- `data`: the data to be updated
- `options`: (optional) an object of options for this mutation

#### Options

- `optimisticData`: the data to be immediately updated in the cache. It will be updated to `data` when the mutation completes.
- `revalidate`: if `true`, the mutation will trigger a revalidation. Defaults to `true`.
- `populateCache`: if `true`, the mutation will write the data to the cache. Defaults to `true`.

#### Example

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

### `boundMutate`

The `boundMutate` function returned by `useSWR` is the same as `mutate` but bound to the key of the hook.

```js
const { data, mutate } = useSWR('/api/user', fetcher)
```

## Global Fetcher

`SWRConfig` can also globally configure the fetcher. If a `fetcher` is set, you can omit the fetcher parameter in `useSWR`.

```js
<SWRConfig value={{
  fetcher: (...args) => fetch(...args).then(res => res.json())
}}>
```

## The `Cache` Type

The cache interface is:

```ts
interface Cache<Data = any> {
  get(key: string): Data | undefined
  set(key: string, value: Data): void
  delete(key: string): void
}
```
