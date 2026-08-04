---
name: swr-pagination
description: SWR pagination patterns — useSWRInfinite for load-more/offset/prev-next pagination. Use when building paginated lists, infinite scroll, or page-based navigation.
title: Pagination
type: guide
summary: Pagination and infinite loading.
prerequisites:
  - /docs/data-fetching
related:
  - /docs/api
---

# Pagination

There are two pagination patterns in SWR: the first is to use the index or page number as a key, and the second is to use the cursor of a list.

## Index Based Pagination

This is the first pattern, using the index or page number as the `key`.

```jsx
function App () {
  const [pageIndex, setPageIndex] = useState(0)

  // The API URL includes the page index, which is a React state.
  // It will change when the page changes.
  const { data } = useSWR(`/api/data?page=${pageIndex}`, fetcher)

  // ... handle loading and error states

  return <div>
    {data.map(item => <div key={item.id}>{item.name}</div>)}
    <button onClick={() => setPageIndex(pageIndex - 1)}>Previous</button>
    <button onClick={() => setPageIndex(pageIndex + 1)}>Next</button>
  </div>
}
```

Similarly, in a list with a "load more" button, you can use the size as the key:

```jsx
const [size, setSize] = useState(1)
const { data } = useSWR(`/api/data?page=${size}`, fetcher)

return <div>
  {data.map(item => <div key={item.id}>{item.name}</div>)}
  <button onClick={() => setSize(size + 1)}>Load more</button>
</div>
```

If you use this pattern, you can use the `useSWRInfinite` hook to enable page navigation and data accumulation across multiple pages in one hook.

## Cursor Based Pagination

This is the second pattern, using the cursor of a list as the `key`. The API response needs to contain the cursor of the next page.

```jsx
const { data } = useSWR(`/api/data?cursor=${cursor}`, fetcher)
```

If you want to load data incrementally, you can use the `useSWRInfinite` hook, which enables pagination and data accumulation across multiple pages in one hook.

## `useSWRInfinite`

With `useSWRInfinite`, we can implement an infinite loading list or a previous/next pagination feature. It is a hook that gives us the ability to:

- fetch a list of data that is already separated by pages, and
- load the data for multiple pages.

### Parameters

#### `getKey`

The `getKey` function receives the index and the previous page data, and returns the key of a page.

```js
function getKey (pageIndex, previousPageData) {
  if (previousPageData && !previousPageData.length) return null // reached the end
  return `/users?page=${pageIndex}&limit=10`                    // SWR key
}
```

#### `fetcher`

The fetcher is the same as the fetcher of `useSWR`. But with `useSWRInfinite`, we can also receive the current page data as the second argument.

```js
const { data } = useSWRInfinite(
  getKey,
  (key, previousPageData) => fetcher(key, previousPageData)
)
```

### Return Values

`useSWRInfinite` returns the same return values as `useSWR`, plus the following:

#### `size`

The number of pages that are currently loaded. You can use `size` to know the current page index.

#### `setSize`

The setter function to change the number of pages that should be loaded. If you want to load the next page, you can call `setSize(size + 1)`. If you want to reset the pages, you can call `setSize(1)`.

#### `data`

The `data` returned by `useSWRInfinite` is an array of the fetcher's return values, for each page. For example, if you have 2 pages, `data` will be `[page0Data, page1Data]`.

## Examples

### Infinite Loading with a Button

```jsx
function App () {
  const { data, error, isLoadingMore, isReachingEnd, loadMore } = useSWRInfinite(
    getKey, fetcher
  )
  ...
}
```

### Infinite Loading with Scroll Event

```jsx
function App () {
  // we can use the `useSWRInfinite` hook to load the data
  const { data, error, size, setSize } = useSWRInfinite(
    getKey, fetcher
  )

  // ... handle loading and error states

  return <div>
    {data.map(item => <div key={item.id}>{item.name}</div>)}
  </div>
}
```

### Infinite Loading with Page Navigation

```jsx
function App () {
  const [pageIndex, setPageIndex] = useState(0)

  // ... handle loading and error states

  return <div>
    {data.map(item => <div key={item.id}>{item.name}</div>)}
    <button onClick={() => setPageIndex(pageIndex - 1)}>Previous</button>
    <button onClick={() => setPageIndex(pageIndex + 1)}>Next</button>
  </div>
}
```
