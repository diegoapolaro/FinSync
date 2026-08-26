# FinSync Design Tokens (Copilot Money Aesthetic)

## Palette Overview

| Token Name | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `primary` | `#1C6CFF` / `#597CAA` | `#1C6CFF` / `#597CAA` | Brand CTA, Active Glow Highlight |
| `background` | `#F8FAFC` | `#000814` | Main App Canvas (Deep Navy in Dark Mode) |
| `card` | `#FFFFFF` | `#09182F` | Surfaces, Containers, Modals |
| `foreground` | `#0F172A` | `#F8FAFC` | Primary Text |
| `muted-foreground` | `#64748B` | `#94A3B8` | Subtitles, Captions, Labels |
| `border` | `#E2E8F0` | `rgba(91, 150, 252, 0.14)` | Dividers, Borders |
| `success` / `entrada` | `#00CC4B` | `#00CC4B` | Receitas / Entradas / Positivo |
| `destructive` / `saida` | `#FF4433` | `#FF4433` | Despesas / Saídas / Negativo |
| `warning` | `#FF9900` | `#FF9900` | Alertas, Pendências |
| `accent-muted` | `#7F8BA4` | `#7F8BA4` | Acentos secundários e tags |

## Geometry & Radii

- `rounded-sm` / `6px`: Badges compactos, tags internas
- `rounded-md` / `14px`: Inputs, botões de ação padrão, filtros
- `rounded-lg` / `20px`: Cards de resumo, cartões de transação
- `rounded-xl` / `40px`: Modais amplos, painéis expansivos
- `rounded-full` / `9999px`: Floating action buttons, avatar badges, pill toggles

## Spacing Grid

- `p-3` (12px) / `p-4` (16px) / `p-6` (24px): Standard card and section padding
- `gap-2` (8px) / `gap-3` (12px) / `gap-4` (16px) / `gap-6` (24px): Grid and flex item spacing

## Shadows & Elevation

- `shadow-card`: `0px 0.362px 0.652px -1.5px rgba(0, 0, 0, 0.07), 0px 3px 5.4px -3px rgba(0, 0, 0, 0.05)`
- `shadow-elevated`: Inset glass lighting shadows
- `shadow-glow-blue`: `0 0 20px rgba(28, 108, 255, 0.35)`
- `shadow-glow-green`: `0 0 20px rgba(0, 204, 75, 0.30)`
- `shadow-glow-red`: `0 0 20px rgba(255, 68, 51, 0.30)`
