# Icons (Hugeicons)

**Always use `@hugeicons/react` and `@hugeicons/core-free-icons` (`HugeiconsIcon`).** 

Never import from `lucide-react`, `@tabler/icons-react`, or hand-roll inline `<svg>`.

---

## 1. Icon Component Usage

Import `HugeiconsIcon` from `@hugeicons/react` and the icon descriptor from `@hugeicons/core-free-icons`:

```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

// Standalone icon
<HugeiconsIcon icon={Search01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
```

---

## 2. Icons in Button use `data-icon` attribute

Add `data-icon="inline-start"` (prefix) or `data-icon="inline-end"` (suffix) to `HugeiconsIcon`. Do not add manual sizing classes (`size-4`, `w-4 h-4`) or margin utilities (`mr-2`, `ml-2`) inside `Button` — shadcn handles spacing and sizing.

**Incorrect:**

```tsx
// Using Lucide with manual margins and sizing
<Button>
  <SearchIcon className="mr-2 size-4" />
  Search
</Button>
```

**Correct:**

```tsx
<Button>
  <HugeiconsIcon icon={Search01Icon} data-icon="inline-start" />
  Search
</Button>

<Button>
  Next
  <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
</Button>
```

---

## 3. No sizing classes on icons inside shadcn components

Shadcn components handle icon sizing via CSS (`[&_svg]:size-4`, etc.). Don't add `size-4`, `w-4 h-4`, or `mr-2` to icons inside `Button`, `DropdownMenuItem`, `Alert`, `Sidebar*`, `ItemMedia`, or `InputGroupAddon`.

**Incorrect:**

```tsx
<Button>
  <HugeiconsIcon icon={Search01Icon} className="size-4" data-icon="inline-start" />
  Search
</Button>

<DropdownMenuItem>
  <HugeiconsIcon icon={Settings02Icon} className="mr-2 size-4" />
  Settings
</DropdownMenuItem>
```

**Correct:**

```tsx
<Button>
  <HugeiconsIcon icon={Search01Icon} data-icon="inline-start" />
  Search
</Button>

<DropdownMenuItem>
  <HugeiconsIcon icon={Settings02Icon} />
  Settings
</DropdownMenuItem>
```

---

## 4. Pass icons as component/descriptor objects, not string keys

Pass the icon descriptor directly to the component.

**Incorrect:**

```tsx
const iconMap = {
  check: CheckmarkCircle02Icon,
  alert: Alert02Icon,
}

function StatusBadge({ icon }: { icon: string }) {
  const IconDescriptor = iconMap[icon]
  return <HugeiconsIcon icon={IconDescriptor} />
}

<StatusBadge icon="check" />
```

**Correct:**

```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

function StatusBadge({ icon }: { icon: typeof CheckmarkCircle02Icon }) {
  return <HugeiconsIcon icon={icon} className="size-4 text-primary" strokeWidth={1.75} />
}

<StatusBadge icon={CheckmarkCircle02Icon} />
```

---

## 5. Visual Styling: No Artificial Background Boxes

Icons should render cleanly with semantic colors (`text-primary`, `text-muted-foreground`, `text-destructive`). Avoid wrapping standalone icons in artificial colored container boxes (e.g. `bg-primary/10 rounded-lg p-2`) unless explicitly creating an avatar or badge card.

**Incorrect:**

```tsx
<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
  <HugeiconsIcon icon={FuelStationIcon} className="size-5" />
</div>
```

**Correct:**

```tsx
<HugeiconsIcon icon={FuelStationIcon} className="size-5 text-primary" strokeWidth={1.75} />
```

