---
name: next-js
description: Production-grade Next.js 16 + React + TypeScript development standards. Generate minimal, scalable, reusable code following official Next.js and shadcn/ui best practices.
---

# Next.js Skill

## Objective

Generate production-ready code that is:

- Minimal
- Reusable
- Type-safe
- Server-first
- Scalable
- Easy to maintain

Always prefer extending existing code over creating new code.

---

# Core Stack

- Next.js (App Router)
- React
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- next-themes
- Lucide React
- date-fns
- sonner

Optional only when needed

- TanStack Query
- Zustand
- nuqs

Never introduce unnecessary dependencies.

---

# General Rules

## DRY

Never duplicate

- business logic
- validation
- fetch logic
- utility functions
- API response structures
- types

Extract reusable code.

---

## KISS

Prefer the simplest solution.

Avoid abstraction until duplication actually exists.

---

## Composition

Prefer small reusable components over large components.

Never build monolithic pages.

---

## Single Responsibility

Every

- component
- hook
- helper
- utility
- action

should have one responsibility.

---

# React Rules

Default to Server Components.

Use Client Components only when required.

Examples

- useState
- useEffect
- browser APIs
- event handlers
- client-only libraries

Never add

```tsx
"use client"
```

unless necessary.

---

# Server Components

Prefer

- async components
- server data fetching
- streaming
- Suspense

Keep server logic on the server.

---

# Data Fetching

Prefer

Server Component

↓

fetch()

↓

cache()

↓

revalidateTag()

↓

revalidatePath()

Avoid client fetching unless interactive.

---

# Server Actions

Prefer Server Actions for mutations.

Avoid unnecessary API routes.

---

# API Routes

When required

```
/api/v1/...
```

Always return

```ts
{
    success: boolean
    data?: T
    error?: {
        code: string
        message: string
    }
}
```

Use proper HTTP status codes.

---

# Validation

Always use Zod.

Validation exists only once.

Never duplicate schemas.

Example

```
schema.ts
```

Shared between

- client
- server
- actions
- API

---

# Forms

Always

- React Hook Form
- Zod Resolver

Never manually validate forms.

---

# State Management

Priority

1. URL
2. Server
3. Form
4. Local State
5. Global State

Global state only if multiple unrelated components need it.

Avoid Zustand unless necessary.

---

# Folder Structure

Prefer feature-first architecture.

Example

```
app/

components/
    ui/
    common/
    forms/
    feedback/

features/
    auth/
    billing/
    dashboard/

hooks/

lib/

types/

styles/
```

---

# Components

Target

- under 100 lines preferred
- under 200 lines maximum

Split immediately if responsibilities increase.

---

# Component Organization

Prefer

```
DashboardHeader

DashboardStats

DashboardCharts

DashboardTable

DashboardFilters
```

Avoid

```
Dashboard.tsx
```

containing everything.

---

# Styling

Use

- Tailwind CSS
- shadcn/ui

Avoid

- inline styles
- CSS Modules
- duplicated utilities

Extract repeated variants using

- cva
- reusable components

---

# shadcn/ui

Always prefer existing components.

Preferred order

- Button
- Input
- Label
- Card
- Form
- Dialog
- Sheet
- Drawer
- Popover
- Select
- DropdownMenu
- Command
- Table
- Badge
- Avatar
- Alert
- Skeleton
- Separator
- ScrollArea
- Tooltip
- Sonner

Do not recreate existing components.

---

# Utilities

Shared utilities belong in

```
lib/
```

Example

```
cn.ts

env.ts

constants.ts

date.ts

format.ts

validators.ts
```

Never create duplicate helpers.

---

# Types

Shared types belong in

```
types/
```

Example

```
api.ts

auth.ts

user.ts
```

Never duplicate interfaces.

---

# Imports

Always use aliases.

Example

```ts
@/components
@/features
@/hooks
@/lib
@/types
```

Avoid long relative imports.

---

# Performance

Always

- next/image
- next/font
- Suspense
- streaming
- lazy loading when appropriate
- server rendering by default

Avoid unnecessary hydration.

---

# Loading States

Provide

```
loading.tsx
```

for every major route.

---

# Error Handling

Use

```
error.tsx
```

Provide useful user feedback.

Never expose internal errors.

---

# Not Found

Provide

```
not-found.tsx
```

when appropriate.

---

# Accessibility

Always

- semantic HTML
- keyboard navigation
- focus states
- labels
- aria attributes

Accessibility is required.

---

# SEO

Prefer Metadata API.

Use

- title
- description
- canonical
- Open Graph
- Twitter metadata

Avoid manual `<head>` management.

---

# Images

Always use

```
next/image
```

Never use raw `<img>` unless unavoidable.

---

# Fonts

Always use

```
next/font
```

Avoid external font CDNs.

---

# Environment Variables

Read environment variables only from

```
lib/env.ts
```

Never access `process.env` throughout the application.

---

# Business Logic

Business logic never belongs inside components.

Move it into

- services
- actions
- lib
- features

Keep components focused on rendering.

---

# Reusable CRUD

Avoid duplicated CRUD implementations.

Prefer reusable abstractions.

Example

```
crud.ts

Create()

Update()

Delete()

Find()

List()
```

---

# Code Generation Rules

Before generating code, always check:

- Does this already exist?
- Can it be reused?
- Can it be generalized?
- Can it be simplified?
- Is there duplicated logic?
- Is this server-first?
- Is this the minimal implementation?
- Is it strongly typed?
- Does it follow official Next.js documentation?

If the answer is no, refactor before generating.

---

# Output Standards

Generated code must be

- production-ready
- clean
- strongly typed
- minimal
- reusable
- scalable
- maintainable
- feature-oriented
- server-first

Avoid unnecessary comments.

Avoid placeholder implementations.

Avoid dead code.

Avoid over-engineering.

Generate only what is required.