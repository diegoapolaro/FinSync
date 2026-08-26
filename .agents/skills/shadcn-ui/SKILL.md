---
name: shadcn-ui
description: >-
  Expertise in searching, creating, scaffolding, and composing Shadcn UI and Radix UI components
  for React 19 and Tailwind CSS. Use this skill whenever adding or modifying UI components,
  working with class-variance-authority (cva), customizing themes, or integrating accessible
  primitives (Dialog, DropdownMenu, Tabs, Switch, Button, Badge, Card, Tooltip, etc.).
---

# Shadcn UI & Accessible Component Architecture

This skill provides guidelines and patterns for building and composing **Shadcn UI** components using **React 19**, **Tailwind CSS**, and **Radix UI** primitives within FinSync's **Copilot Money** visual system.

---

## 1. Core Principles

1. **Copy/Paste Component Ownership**: Components live inside the project (`client/src/components/ui/` or `client/src/components/common/`), not as an opaque npm library. You own and customize the source code.
2. **CVA & Tailwind Merge (`cn`)**: All component styling must be structured using `class-variance-authority` (cva) and the `cn()` helper (`clsx` + `tailwind-merge`) for dynamic and overrideable classes.
3. **Radix Primitives**: Always ensure keyboard accessibility, focus management, ARIA roles, and screen reader announcements.
4. **React 19 Compatibility**: Use modern React 19 patterns (e.g., standard `ref` props without unnecessary `forwardRef` when applicable, standard action transitions).

---

## 2. Utility Helper: `cn`

Always verify that `cn` is imported or defined as:
```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

---

## 3. Creating Components with CVA

### Button Example (Copilot Money Theme)
```javascript
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-blue",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-glow-red",
        positive: "bg-entrada text-white hover:bg-entrada/90 shadow-glow-green",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-10 w-10 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function Button({ className, variant, size, children, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## 4. Modal / Dialog Pattern (Accessible)

- Use proper backdrop blur (`backdrop-blur-sm`), escape-key listener, portal rendering, and trap focus.
- Ensure click-outside dismisses the modal gracefully.
- Include clear titles and descriptions for screen readers (`aria-labelledby`, `aria-describedby`).
- Apply Copilot theme geometry (`rounded-lg` / `rounded-xl`, `bg-card`, `border-border`).

---

## 5. Integrating with MCP Servers

When the `shadcn` or `azure` MCP servers are active:
- Use the MCP tools to query component recipes, templates, and copyable JSX structures.
- Adapt all extracted code to match FinSync's token palette (`#1C6CFF` / `#597CAA` primary, `#00CC4B` positive, `#FF4433` negative, Deep Space Navy `#000814` canvas, `Inter` + `IBM Plex Mono` fonts).
