---
name: swr-nextjs
description: SWR usage with Next.js — client-side data fetching in App Router, avoid SSR issues, use with server components. Use when using SWR in Next.js pages or app directory.
title: Usage with Next.js
type: guide
summary: SWR with Next.js.
prerequisites:
  - /docs/data-fetching
related:
  - /docs/suspense
---

# Usage with Next.js

Next.js supports both client-side and server-side data fetching. SWR is a client-side data fetching library, so it works best when used in client-side rendered pages or components. When you use SWR in a server-side rendered page, the data will be fetched on the client side.

## Client Side

If you want to fetch data on the client side, you can use SWR in any client component. In Next.js App Router, you need to add `'use client'` at the top of the file.

```jsx
'use client'
import useSWR from 'swr'

function Profile () {
  const { data, error } = useSWR('/api/user', fetcher)

  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>

  return <div>hello {data.name}!</div>
}
```

## Server Side

Since SWR is a client-side data fetching library, it doesn't support server-side fetching on its own. If you want to fetch data on the server side, you can use Next.js's server-side rendering features like `fetch`, `getServerSideProps`, `getStaticProps` (in Pages Router), or Server Components (in App Router). Then pass the data to the client component via props, and use SWR with the `fallbackData` option.

```jsx
'use client'
import useSWR from 'swr'

function Profile ({ fallback }) {
  const { data, error } = useSWR('/api/user', fetcher, { fallbackData: fallback.user })

  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>

  return <div>hello {data.name}!</div>
}
```

```jsx
// server component
import { getUser } from './user'

export default async function Page () {
  const user = await getUser()
  return <Profile fallback={{ user }} />
}
```
