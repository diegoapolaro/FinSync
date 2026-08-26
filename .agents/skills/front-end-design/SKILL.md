---
name: front-end-design
description: >-
  Comprehensive guide for modern front-end engineering, React 19 architecture, micro-interactions,
  responsive UI layout, state machines, loading skeletons, error boundaries, and optimistic UI updates.
  Use this skill whenever designing or implementing new views, pages, complex interactive forms,
  dashboards, tables, or mobile-first layouts.
---

# Front-End Design & Architecture

This skill defines engineering best practices for building responsive, accessible, high-performance web applications using **React 19**, **Tailwind CSS**, and modern UI patterns.

---

## 1. Architecture: Vertical Slices & Component Hierarchy

- **Page-Level Views** (`client/src/pages/`): Responsible for route-level data orchestration, high-level layout coordination, and top-level error boundaries.
- **Domain Components** (`client/src/components/<domain>/`): Encapsulate feature-specific logic (e.g. `TransactionCard`, `TransactionTable`, `ChartContainer`).
- **Common & Shared Primitives** (`client/src/components/common/`): Pure, reusable UI components (`SummaryCard`, `Modal`, `FloatingActions`, `PeriodoPicker`, `ResponsiveGrid`).

---

## 2. Interaction & State Design Rules

1. **Optimistic Updates**: When the user performs an action (e.g., adding a transaction or toggling archive), update the local state immediately while sending the API request in the background. Revert and show a Toast if the request fails.
2. **Loading States & Skeletons**: Never show empty or jumping layouts during asynchronous fetches. Use pulsating skeleton cards (`animate-pulse bg-muted rounded-2xl`) mirroring the final layout shape.
3. **Empty States**: If a table or list has 0 items, display an engaging empty state with an icon, informative copy, and a primary call-to-action button.
4. **Micro-Interactions**:
   - Button click bounce: `active:scale-[0.98]`
   - Hover card lifts: `transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`
   - Smooth dialog fades: `transition-opacity duration-200`

---

## 3. Responsive Layout Strategy (Mobile-First)

- **Mobile Viewports (< 768px)**:
  - Bottom navigation bar (`BottomNav`) fixed at the bottom with safe area insets.
  - Floating action button (FAB) for primary creation actions.
  - Card-based lists instead of wide horizontal tables (`TransactionCard`).
- **Desktop Viewports (>= 768px)**:
  - Sidebar navigation (`DesktopSidebar`) or clean top bar (`DesktopHeader`).
  - Multi-column metric grids (`grid grid-cols-1 md:grid-cols-3 gap-6`).
  - High-density data tables (`TransactionTable`) with sorting and action menus.

---

## 4. References & Detailed Patterns

See the supplementary guide for code templates and patterns:
- [Component Patterns & State Management](./references/components_patterns.md)
