---
name: web-design-guidelines
description: >-
  Visual design system, UI/UX heuristics, typography hierarchy, color tokens, and accessibility (WCAG AA)
  guidelines inspired by the Copilot Money fintech aesthetic. Use this skill whenever styling
  interfaces, choosing colors, structuring visual hierarchy, applying border radius, adjusting contrast,
  or aligning components to FinSync's DESIGN.md specifications.
---

# Web Design Guidelines (Copilot Money Fintech Aesthetic)

This skill governs the visual and ergonomic design rules for FinSync, drawing inspiration from **Copilot Money** (*Apple Design Award style*) and modern cinematic data-dense fintech product aesthetics.

---

## 1. Visual Identity & Brand Philosophy

1. **Cinematic, High Data-Density & Functional**: Content-first interfaces with deep contrast, glass elevation, and crisp typographic hierarchy.
2. **Curved & Pill Geometries**:
   - Small Badges & Inner Tags: `rounded-[6px]` (`rounded-sm`).
   - Inputs, Buttons & Controls: `rounded-[14px]` (`rounded-md`).
   - Cards & Section Containers: `rounded-[20px]` (`rounded-lg`) to `rounded-2xl` (`24px`).
   - Expanded Panels & Sheets: `rounded-[40px]` (`rounded-xl`).
   - Toggles, FABs & Badges: `rounded-full`.
3. **Color Palette & Accents**:
   - **Primary Brand Accent**: Electric Blue / Slate (`#1C6CFF` / `#597CAA`) — Used for primary CTAs, active highlights, and glows.
   - **Canvas / Background**:
     - Dark Mode: Deep Space Navy (`#000814`) with Navy Cards (`#09182F`).
     - Light Mode: Clean Light (`#F8FAFC`) with Pure White Cards (`#FFFFFF`).
   - **Text & Foreground**: Crisp White (`#F8FAFC`) / Deep Slate (`#0F172A`).
   - **Financial Indicators**:
     - Entradas / Positivo: Green (`#00CC4B`)
     - Saídas / Negativo: Red (`#FF4433`)
     - Avisos / Alertas: Amber (`#FF9900`)
     - Accent Muted: (`#7F8BA4`)

---

## 2. Typography Hierarchy

- **Display & Headings**: `Inter` / `Jokker Medium`, font-weight 500 to 700 with tight tracking (`tracking-tight`) and line-height 1.2.
- **Body & Captions**: `Inter`, font-weight 400 and 500 with comfortable line height (`leading-relaxed` / 1.4).
- **Financial Values & Dates**: `IBM Plex Mono` for tabular alignment and crisp digit readability (`font-feature-settings: 'tnum' 1`).

---

## 3. Ergonomics & Accessibility (WCAG AA)

- **Contrast Ratios**: Minimum 4.5:1 for normal text and 3:1 for large text / UI controls.
- **Dark Mode Support**: Ensure semantic CSS variables for background, foreground, border, and muted colors. Always use tokenized theme classes.
- **Touch Targets**: Minimum `44px x 44px` on interactive mobile elements.
- **Focus Rings**: High-contrast, visible focus rings on keyboard navigation (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).

---

## 4. Design Tokens Reference

For the complete list of CSS variables, hex codes, and utility classes, consult:
- [FinSync Design Tokens](./references/finsync_tokens.md)
- [Project DESIGN.md](../../../DESIGN.md)
