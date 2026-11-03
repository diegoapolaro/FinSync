---
version: 1.0.0
name: Wise-style-reference
description: >-
  deep moss with lime voltage. Lime sparks on a near-black forest floor, with massive blocky display type announcing every move.
  Wise speaks in a confident, slightly loud voice: a deep forest green (#163300) carries most of the surface area — text, nav, dark sections, icons — while a single electric lime (#9fe870) acts as functional punctuation on CTAs, active tabs, and key highlights.
theme: light
colors:
  forest-ink: "#163300"
  lime-voltage: "#9fe870"
  spruce: "#054d28"
  linen-mist: "#e2f6d5"
  signal-blue: "#0b4c72"
  alarm-red: "#cb272f"
  charcoal: "#454745"
  obsidian: "#0e0f0c"
  pebble: "#868685"
  slate: "#6a6c6a"
  fog: "#e8ebe6"
  paper: "#ffffff"
---

# Wise — Style Reference

> **deep moss with lime voltage.** Lime sparks on a near-black forest floor, with massive blocky display type announcing every move.

**Theme:** light / dynamic dark inversion

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

Wise speaks in a confident, slightly loud voice: a deep forest green (`#163300`) carries most of the surface area — text, nav, dark sections, icons — while a single electric lime (`#9fe870`) acts as functional punctuation on CTAs, active tabs, and key highlights. The display type is almost aggressive: Wise Sans at weight 900, tightly tracked, shouted across the hero in 100px+ block letters. The rest of the system stays restrained on a near-white canvas with soft gray surfaces (`#e8ebe6`). Components are pill-shaped by default — buttons, nav segments, flag thumbnails, image masks — with gentle 10px radii reserved for cards and inputs. Color rarely gradients; instead, the lime–forest pairing inverts cleanly when sections go dark, creating rhythm without decoration.

---

## Tokens — Colors

| Name | Value | Token | Role |
| :--- | :--- | :--- | :--- |
| **Forest Ink** | `#163300` | `--color-forest-ink` | Dominant brand dark — nav text, dark section backgrounds, primary copy on light surfaces, icon strokes, filled navigation pills. This is the brand's gravity: wherever you need weight or authority, you reach for Forest Ink. |
| **Lime Voltage** | `#9fe870` | `--color-lime-voltage` | Green supporting accent for primary CTA fills, active tabs, selected states, and high-energy punctuation. Do not use as text on white. |
| **Spruce** | `#054d28` | `--color-spruce` | Secondary dark green for card surfaces, supporting iconography, and tonal depth on dark sections where Forest Ink is too heavy. |
| **Linen Mist** | `#e2f6d5` | `--color-linen-mist` | Pale green wash for soft highlight surfaces, tinted card backgrounds, nav hover states. A whisper of the brand green for low-emphasis containers. |
| **Signal Blue** | `#0b4c72` | `--color-signal-blue` | Blue supporting accent for decorative details and low-frequency emphasis. |
| **Alarm Red** | `#cb272f` | `--color-alarm-red` | Red supporting accent for despesas/saídas and low-frequency warnings. |
| **Charcoal** | `#454745` | `--color-charcoal` | Primary text, body copy, dense UI — slightly warm black that feels softer than pure `#000` against white. |
| **Obsidian** | `#0e0f0c` | `--color-obsidian` | Display headlines, high-contrast headings, pure-black moments in nav and hero. Slightly green-tinted black, not neutral gray. |
| **Pebble** | `#868685` | `--color-pebble` | Muted secondary text, placeholder copy, icon strokes, input borders. The mid-gray that recedes. |
| **Slate** | `#6a6c6a` | `--color-slate` | Supporting body text, helper labels, subdued iconography. One step darker than Pebble for slightly more emphasis. |
| **Fog** | `#e8ebe6` | `--color-fog` | Card surfaces, section dividers, subtle panel backgrounds on the white canvas. Green-tinted off-white, not pure neutral. |
| **Paper** | `#ffffff` | `--color-paper` | Page canvas, inverted card surfaces, button text on lime fill. |

---

## Tokens — Typography

### Inter — Body, UI, labels, and sub-headings across the entire product
The 700 weight handles mid-tier headings (36–45px), 500–600 for subheadings and labels, 400 for body and captions. Inter does the quiet work while Wise Sans shouts. · `--font-inter`
- **Substitute:** Inter (native Google Fonts)
- **Weights:** 400, 500, 600, 700
- **Sizes:** 12px, 14px, 16px, 18px, 20px, 22px, 25px, 36px, 45px, 61px, 300px
- **Line height:** 0.72, 1.00, 1.10, 1.25, 1.30, 1.40, 1.43, 1.44, 1.50, 1.55, 1.63, 1.71, 1.86, 2.17
- **Letter spacing:** -0.030em at 105px, -0.015em at 61px, -0.011em at 36px, -0.009em at 25px, -0.007em at 18px, -0.006em at 16px, -0.005em at 14px, -0.003em at 12px
- **OpenType features:** `"calt"`

### Wise Sans — Display headlines — the brand's signature shout
Ultra-heavy weight 900 at 89–105px with tight -0.03em tracking makes every headline a block-letter announcement. Used sparingly: hero, section openers, campaign moments. · `--font-wise-sans`
- **Substitute:** Inter Black (900) with -0.04em tracking
- **Weights:** 900
- **Sizes:** 40px, 52px, 59px, 89px, 105px, 300px
- **Line height:** 0.85, 1.50
- **Letter spacing:** -0.0020em
- **OpenType features:** `"calt"`

### Monospace (Tabular Numbers & Code)
- **Family:** `IBM Plex Mono`, `SF Mono`, `Menlo`, monospace
- **Role:** Monetary values, tabular alignment, dates, cryptographic identifiers.

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **micro** | Inter | 500 | 12px | 1.63 | -0.036px | `--text-micro` |
| **caption** | Inter | 400/500 | 14px | 1.55 | -0.07px | `--text-caption` |
| **body-sm** | Inter | 400/500 | 16px | 1.5 | -0.096px | `--text-body-sm` |
| **body** | Inter | 400 | 18px | 1.5 | -0.126px | `--text-body` |
| **body-lg** | Inter | 500 | 25px | 1.3 | -0.225px | `--text-body-lg` |
| **subheading** | Inter | 700 | 36px | 1.25 | -0.396px | `--text-subheading` |
| **heading-sm** | Inter | 700 | 45px | 1.1 | -0.495px | `--text-heading-sm` |
| **heading** | Inter/Wise Sans | 700/900 | 61px | 1.1 | -0.915px | `--text-heading` |
| **heading-lg** | Wise Sans | 900 | 89px | 0.85 | -2.67px | `--text-heading-lg` |
| **display** | Wise Sans | 900 | 105px | 0.85 | -3.15px | `--text-display` |

---

## Tokens — Spacing & Shapes

**Base unit:** 4px  
**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
| :--- | :--- | :--- |
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 28 | 28px | `--spacing-28` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 44 | 44px | `--spacing-44` |
| 48 | 48px | `--spacing-48` |
| 56 | 56px | `--spacing-56` |
| 64 | 64px | `--spacing-64` |
| 100 | 100px | `--spacing-100` |
| 124 | 124px | `--spacing-124` |

### Border Radius

| Element | Value | Class |
| :--- | :--- | :--- |
| **tags / badges** | 9999px | `rounded-full` |
| **buttons** | 9999px | `rounded-full` |
| **navSegments** | 9999px | `rounded-full` |
| **cards** | 10px / 16px | `rounded-[10px]` ou `rounded-xl` |
| **inputs** | 10px | `rounded-[10px]` |
| **largeCards** | 28px | `rounded-[28px]` |

### Shadows

| Name | Value | Token |
| :--- | :--- | :--- |
| **subtle** | `rgba(14, 15, 12, 0.12) 0px 0px 0px 1px` | `--shadow-subtle` |
| **subtle-2** | `rgb(134, 134, 133) 0px 0px 0px 1px inset` | `--shadow-subtle-2` |
| **xl** | `rgba(0, 0, 0, 0.15) 0px 10px 32px 0px, rgba(0, 0, 0, 0.04) 0px 40px 40px 0px` | `--shadow-xl` |
| **lg** | `rgba(0, 0, 0, 0.08) 0px 6px 20px 0px` | `--shadow-lg` |

### Layout

- **Page max-width:** 1200px
- **Section gap:** 64-80px
- **Card padding:** 24px
- **Element gap:** 8-12px

---

## Components

### Primary CTA Pill Button
- **Role:** The signature action element — filled lime pill that signals "do this next."
- Fully rounded (9999px radius) button with **Lime Voltage (`#9fe870`)** fill and **Forest Ink (`#163300`)** text.
- Padding: 11px vertical, 24px horizontal (`h-11 px-6 rounded-full`).
- Font: Inter weight 600 at 16px.
- No border, no drop shadow — the fill does all the work.

### Outlined Pill Button
- **Role:** Secondary action in the nav and inline CTAs.
- White / Paper fill, 1px solid **Forest Ink (`#163300`)** border, 9999px radius (`rounded-full`).
- Text in Forest Ink (`#163300`).

### Segmented Tab Control
- **Role:** In-page section switcher — single active state in lime.
- Pill container (`rounded-full bg-fog p-1`) holding multiple text labels.
- Active tab: **Lime Voltage (`#9fe870`)** fill with **Forest Ink (`#163300`)** bold text.
- Inactive tabs: transparent with Charcoal (`#454745`) text.

### Dark Section Card
- **Role:** Inverted surface for emphasis — e.g. Hero Saldo Líquido, callouts.
- **Forest Ink (`#163300`)** background, 28px radius (`rounded-[28px]`), 32-40px padding.
- **Lime Voltage (`#9fe870`)** text for key numbers and titles, Paper (`#ffffff`) for body.

### Badge / Tag
- **Role:** Small status labels and category tags.
- 9999px radius (`rounded-full`), 4px vertical and 10px horizontal padding.
- **Linen Mist (`#e2f6d5`)** background with **Forest Ink (`#163300`)** text, or **Forest Ink** background with **Lime Voltage** text.

---

## Do's and Don'ts

### Do
- Set display headlines in Wise Sans weight 900 with letter-spacing -3.15px at 105px; the extreme heaviness is the brand's signature — don't soften it to 700.
- Use **Lime Voltage (`#9fe870`)** for primary action fills and active states; one lime element per visible viewport section is usually enough.
- Default to 9999px radius (`rounded-full`) for all buttons, tags, and nav segments — pill shapes are foundational.
- Use **Forest Ink (`#163300`)** for text and dark surfaces, not pure black; the green-tinted near-black is warmer and more on-brand.
- Invert section backgrounds from white to Forest Ink to create rhythm; lime text on dark green is the system's built-in emphasis.

### Don't
- Don't use Charcoal (`#454745`) for display headlines — reserve Obsidian (`#0e0f0c`) or Forest Ink for maximum contrast.
- Don't introduce gradients, drop shadows beyond hairline borders, or decorative blurs — the system is flat by design.
- Don't use Lime Voltage as text color on light backgrounds; its contrast is too low. It only works as fill or on dark green.
- Don't use sharp corners (0–4px radius) on buttons, tags, or nav elements; pills are the default shape language.
- Don't stack multiple lime elements close together; space them so the accent reads as a single punctuation mark.

---

## Surfaces

| Level | Name | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **0** | Paper | `#ffffff` | Page canvas — the default background for all content sections. |
| **1** | Fog | `#e8ebe6` | Card surfaces, soft panels, and section backgrounds on the white canvas. |
| **2** | Linen Mist | `#e2f6d5` | Tinted highlight surfaces — pale green wash for accent containers and hover states. |
| **3** | Lime Voltage | `#9fe870` | Active surface — selected tabs, primary CTA fill, emphasis zones. |
| **4** | Forest Ink | `#163300` | Inverted surface — dark section backgrounds, nav, high-contrast blocks. |

---

## Quick Start Codes

### CSS Custom Properties (`variables.css`)

```css
:root {
  /* Wise Brand Colors */
  --color-forest-ink: #163300;
  --color-lime-voltage: #9fe870;
  --color-spruce: #054d28;
  --color-linen-mist: #e2f6d5;
  --color-signal-blue: #0b4c72;
  --color-alarm-red: #cb272f;
  --color-charcoal: #454745;
  --color-obsidian: #0e0f0c;
  --color-pebble: #868685;
  --color-slate: #6a6c6a;
  --color-fog: #e8ebe6;
  --color-paper: #ffffff;

  /* Typography */
  --font-inter: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-wise-sans: 'Wise Sans', 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Primary Mappings */
  --color-primary: #163300;
  --color-primary-active: #054d28;
  --color-primary-disabled: #868685;
  --color-entrada: #163300;
  --color-saida: #cb272f;

  /* Shadcn / Tailwind Theme Variables (Light) */
  --background: 0 0% 100%; /* #ffffff */
  --foreground: 95 100% 10%; /* #163300 */
  --card: 96 11% 91%; /* #e8ebe6 Fog */
  --card-foreground: 95 100% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 95 100% 10%;
  --primary: 95 100% 10%; /* #163300 Forest Ink */
  --primary-foreground: 97 73% 67%; /* #9fe870 Lime Voltage */
  --secondary: 96 11% 91%; /* #e8ebe6 Fog */
  --secondary-foreground: 95 100% 10%;
  --muted: 96 11% 91%; /* #e8ebe6 */
  --muted-foreground: 120 1% 37%; /* #454745 */
  --accent: 97 73% 67%; /* #9fe870 Lime Voltage */
  --accent-foreground: 95 100% 10%;
  --destructive: 357 68% 47%; /* #cb272f */
  --destructive-foreground: 0 0% 100%;
  --border: 96 11% 86%; /* subtle fog border */
  --input: 96 11% 86%;
  --ring: 97 73% 67%;
  --radius: 0.625rem; /* 10px */
}

:root.dark {
  /* Wise Inverted Dark Theme */
  --background: 95 100% 10%; /* #163300 Forest floor */
  --foreground: 0 0% 100%; /* #ffffff Paper */
  --card: 150 88% 16%; /* #054d28 Spruce */
  --card-foreground: 0 0% 100%;
  --popover: 95 100% 10%;
  --popover-foreground: 0 0% 100%;
  --primary: 97 73% 67%; /* #9fe870 Lime Voltage */
  --primary-foreground: 95 100% 10%; /* Forest Ink text */
  --secondary: 150 88% 16%;
  --secondary-foreground: 0 0% 100%;
  --muted: 150 88% 16%;
  --muted-foreground: 96 11% 91%;
  --accent: 97 73% 67%;
  --accent-foreground: 95 100% 10%;
  --destructive: 357 68% 47%;
  --destructive-foreground: 0 0% 100%;
  --border: 150 88% 22%;
  --input: 150 88% 22%;
  --ring: 97 73% 67%;
}
```

### Tailwind Config (`tailwind.config.js`)

```js
colors: {
  'forest-ink': '#163300',
  'lime-voltage': '#9fe870',
  'spruce': '#054d28',
  'linen-mist': '#e2f6d5',
  'signal-blue': '#0b4c72',
  'alarm-red': '#cb272f',
  'charcoal': '#454745',
  'obsidian': '#0e0f0c',
  'pebble': '#868685',
  'slate': '#6a6c6a',
  'fog': '#e8ebe6',
  'paper': '#ffffff',
}
```