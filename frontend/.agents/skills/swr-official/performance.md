---
name: swr-performance
description: SWR performance optimization — preventing unnecessary rerenders, preloading, deduplication, and avoiding waterfall requests. Use when optimizing SWR-driven UI.
title: Performance
type: guide
summary: Optimize SWR performance.
prerequisites:
  - /docs/data-fetching
related:
  - /docs/prefetching
---

# Performance

SWR is designed to be performant. It caches the data, deduplicates the requests, and avoids unnecessary rerenders.

## Deduplication

SWR deduplicates requests with the same key within the `dedupingInterval` (default `2000`ms). This means if multiple components use the same key, only one request will be sent.

## Avoid Unnecessary Rerenders

SWR compares the data with the `compare` function (defaults to `Object.is`). If the data hasn't changed, the component won't rerender. You can customize the `compare` function in the config.

## Avoid Waterfall Requests

Dependent fetching can create waterfalls. To avoid them, you can prefetch the data, or restructure the keys. Use the `preload` API or the `fallback` option to make data available before it's rendered.

## Preloading

Preload data for the pages that are very likely to be visited. See the [prefetching guide](/docs/prefetching) for details.

## Immutable Data

If the data is immutable and will not change, use the `useSWRImmutable` hook to disable all revalidations. This saves network requests.

## Throttle Revalidations

Use `focusThrottleInterval` to throttle revalidations triggered by focus events, and `errorRetryInterval` / `errorRetryCount` to control error retry behavior.
