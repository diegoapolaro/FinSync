# Supplementary Component Patterns

## 1. Skeleton Loader Pattern

```jsx
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 w-full animate-pulse rounded-2xl bg-black/5 dark:bg-white/5"
        />
      ))}
    </div>
  );
}
```

## 2. Empty State Pattern

```jsx
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/common/Button";

export function EmptyState({ title, description, onAction, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 mb-4 text-muted-foreground">
        <FolderOpen className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
```

## 3. Responsive Form with Inline Validation

- Keep inputs grouped logically with clear labels and error messages.
- Always provide accessible `aria-invalid` and `aria-describedby` when errors occur.
- Use input masks or formatted currency fields for financial values with IBM Plex Mono font.
