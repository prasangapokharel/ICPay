---
name: swr-arguments
description: SWR key arguments — string, function, array, and null keys. Use when designing SWR keys for API endpoints, dependent fetches, or conditional fetching.
title: Arguments
type: guide
summary: The key argument of SWR.
prerequisites:
  - /docs/data-fetching
related:
  - /docs/conditional-fetching
---

# Arguments

The `key` is the unique identifier of a request. It's the first argument of `useSWR`. It can be a string, an array, a function, or `null`.

## String Key

The most common form. The string is the unique identifier of the request, and is usually the URL of the API:

```js
useSWR('/api/user', fetcher)
```

## Array Key

You can also use an array as the key. This is useful when the request depends on multiple values:

```js
useSWR(['/api/user', id], fetcher)
```

The array will be passed to the fetcher as arguments:

```js
fetcher = (url, id) => fetch(url + '?id=' + id).then(res => res.json())
```

## Function Key

You can also use a function as the key. The function must return a valid key (string, array, or `null`). If the function throws or returns a falsy value, SWR won't start the request:

```js
useSWR(() => '/api/user?uid=' + user.id, fetcher)
```

This is useful for dependent fetching and conditional fetching.

## Null Key

When the key is `null`, SWR won't start the request:

```js
useSWR(null, fetcher)
```

## Object Key

You can also use an object as the key, as long as it can be serialized. SWR will compare the keys to determine if the data should be reused.

## Non-Serializable Keys

Keys should be serializable. If you use a non-serializable key (like an object that changes on every render), SWR will think the key changed every time and refetch.
