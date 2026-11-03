---
name: web-design-guidelines
description: >-
  Visual design system, UI/UX heuristics, typography hierarchy, color tokens, and accessibility (WCAG AA)
  guidelines inspired by the Wise design aesthetic (Deep Moss with Lime Voltage). Use this skill whenever styling
  interfaces, choosing colors, structuring visual hierarchy, applying border radius, adjusting contrast,
  or aligning components to FinSync's DESIGN.md specifications.
---

# Web Design Guidelines (Wise Aesthetic — Deep Moss with Lime Voltage)

This skill governs the visual and ergonomic design rules for FinSync, based on the **Wise Design System** (*Deep Moss with Lime Voltage*).

---

## 1. Visual Identity & Brand Philosophy

1. **Confident, High-Impact & Data-Dense**: Content-first interface with deep forest green authority, crisp off-white canvas, and electric lime functional punctuation.
2. **Pill & Card Geometries**:
   - Buttons, Tags, Badges & Nav Segments: `rounded-full` (9999px pill shapes).
   - Standard Cards & Inputs: `rounded-[10px]` (`rounded-lg`).
   - Large Feature Cards & Hero Panels: `rounded-[28px]`.
3. **Color Palette & Accents**:
   - **Dominant Brand Dark (Forest Ink)**: `#163300` — Used for text, nav text, dark section backgrounds, primary icons, and authority.
   - **Signature Accent (Lime Voltage)**: `#9fe870` — Used for primary CTA button fills, active tabs, selected states, and highlights.
   - **Secondary Dark (Spruce)**: `#054d28` — Secondary dark green for elevated cards and depth.
   - **Soft Green Wash (Linen Mist)**: `#e2f6d5` — Pale green wash for tags, soft containers, and hover states.
   - **Background Canvas (Paper)**: `#ffffff` — Default light canvas.
   - **Soft Panels & Cards (Fog)**: `#e8ebe6` — Green-tinted off-white for cards, dividers, and subtle sections.
   - **Body & Secondary Copy**: `#454745` (Charcoal) / `#868685` (Pebble).
   - **Despesas / Saídas (Alarm Red)**: `#cb272f`.

---

## 2. Typography Hierarchy

- **Display & Headings**: `Wise Sans` / `Inter` weight 900 / 700 with tight tracking (`tracking-tight` / `-0.03em`) and line-height 0.85 to 1.1.
- **Body & Labels**: `Inter`, font-weight 400 and 500.
- **Financial Values & Tabular Numbers**: `IBM Plex Mono` / mono (`font-feature-settings: 'tnum' 1`).

---

## 3. Ergonomics & Accessibility (WCAG AA)

- **Contrast Ratios**: Minimum 4.5:1 for normal text and 3:1 for large text. Never use Lime Voltage (`#9fe870`) as text on white backgrounds; use it as a fill with Forest Ink (`#163300`) text, or as text on dark green surfaces.
- **Pill Primary CTA**: Always pair a solid Lime Voltage pill with Forest Ink text for primary actions.

---

## 4. References & Tokens

Consult:
- [FinSync Design Tokens](./references/finsync_tokens.md)
- [Project DESIGN.md](../../../DESIGN.md)
