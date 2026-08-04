---
name: shadcn
description: Production-grade shadcn/ui standards for building consistent, accessible, reusable, and minimal React components.
---

# shadcn/ui Skill

## Objective

Build modern interfaces using **shadcn/ui** as the primary component library.

Always prefer existing shadcn components before creating custom ones.

The goal is to produce UI that is:

- Minimal
- Accessible
- Consistent
- Reusable
- Scalable
- Responsive
- Theme-aware

---

# Core Principles

Always use

- shadcn/ui
- Tailwind CSS
- Radix UI primitives
- CVA (Class Variance Authority)
- Lucide React icons

Never recreate functionality that already exists in shadcn/ui.

---

# Component Priority

Always check for an existing component before creating a custom one.

Preferred components

- Button
- Input
- Textarea
- Label
- Card
- Badge
- Avatar
- Separator
- Skeleton
- Alert
- AlertDialog
- Dialog
- Drawer
- Sheet
- Popover
- HoverCard
- Tooltip
- DropdownMenu
- NavigationMenu
- Menubar
- ContextMenu
- Select
- Combobox (Command + Popover)
- Command
- Tabs
- Accordion
- Collapsible
- ScrollArea
- Table
- Pagination
- Breadcrumb
- Calendar
- Date Picker
- Form
- Checkbox
- RadioGroup
- Switch
- Slider
- Progress
- Sonner

Only build custom components when no suitable shadcn component exists.

---

# Component Composition

Prefer composition.

Example

```
Card

CardHeader

CardTitle

CardDescription

CardContent

CardFooter
```

Never flatten component hierarchies.

---

# Forms

Always use

- Form
- React Hook Form
- Zod

Never manually manage validation.

---

# Styling

Use Tailwind utilities.

Avoid

- inline styles
- CSS Modules
- styled-components
- Emotion

Keep styling inside components.

---

# Variants

Use CVA for reusable variants.

Good examples

- Button variants
- Badge variants
- Alert variants
- Card variants

Never duplicate Tailwind classes across components.

---

# Responsive Design

Use mobile-first design.

Typical breakpoints

```
sm
md
lg
xl
2xl
```

Never build desktop-first layouts.

---

# Layout

Prefer

- flex
- grid
- gap

Avoid excessive wrapper elements.

Keep DOM shallow.

---

# Spacing

Use Tailwind spacing scale.

Avoid arbitrary values unless required.

Prefer

```
gap-2
gap-4
gap-6

p-4
p-6

space-y-4
space-y-6
```

Maintain consistent spacing.

---

# Typography

Use semantic HTML.

Prefer

- h1
- h2
- h3
- p
- small
- strong

Avoid divs for text.

---

# Icons

Always use Lucide React.

Keep icon sizes consistent.

Typical sizes

```
size-4
size-5
size-6
```

Avoid mixing icon libraries.

---

# Buttons

Prefer existing variants.

Examples

- default
- secondary
- outline
- ghost
- destructive
- link

Do not create duplicate button components.

---

# Dialogs

Prefer

- Dialog
- Sheet
- Drawer

Choose based on UX.

Do not reinvent modal logic.

---

# Tables

Use shadcn Table.

Support

- empty states
- loading states
- responsive overflow

Avoid custom HTML tables unless necessary.

---

# Loading States

Always use

- Skeleton
- Spinner (if available)
- Loading text

Avoid blank screens.

---

# Empty States

Provide

- title
- description
- primary action

Never leave empty pages.

---

# Error States

Display

- icon
- title
- description
- retry action (when applicable)

Avoid raw error messages.

---

# Accessibility

Always include

- keyboard navigation
- focus-visible styles
- labels
- aria attributes
- semantic HTML

Never remove accessibility features from Radix components.

---

# Dark Mode

Support both

- light
- dark

Use CSS variables.

Never hardcode colors.

---

# Theme

Use semantic tokens.

Example

```
bg-background
text-foreground

border-border

text-muted-foreground

bg-muted

bg-card

ring-ring

accent-accent
```

Avoid direct colors like

```
bg-white

text-black

border-gray-200
```

unless absolutely necessary.

---

# Animations

Use minimal animations.

Prefer

- fade
- slide
- scale

Avoid excessive motion.

Respect reduced motion preferences.

---

# Reusable Components

Shared UI belongs in

```
components/ui/
```

Business-specific components belong in

```
features/<feature>/components/
```

Never place business logic inside reusable UI components.

---

# Custom Components

Create custom components only when

- no shadcn equivalent exists
- multiple features reuse it
- it improves consistency

Keep APIs simple.

---

# Performance

Avoid unnecessary re-renders.

Memoize only when profiling justifies it.

Prefer server-rendered content where possible.

Lazy-load heavy interactive components.

---

# Code Standards

Components should

- have a single responsibility
- be strongly typed
- be composable
- remain under 200 lines
- avoid duplicated markup
- avoid duplicated Tailwind classes

Extract reusable pieces early.

---

# Before Creating a Component

Always ask

- Does shadcn already provide this?
- Can an existing component be extended?
- Can variants solve this?
- Can composition solve this?
- Is the API minimal?
- Is it accessible?
- Is it responsive?
- Is it theme-aware?

If yes, extend existing components instead of creating new ones.

---

# Output Standards

Generated UI must be

- production-ready
- accessible
- responsive
- theme-aware
- composable
- minimal
- scalable
- reusable
- consistent

Follow the official shadcn/ui patterns and avoid unnecessary abstraction or duplication.