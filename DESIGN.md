---
name: SISTEM QC BERKAS
description: Enterprise document quality control management system
colors:
  primary-blue: "#2563eb"
  primary-blue-dark: "#1e40af"
  secondary-slate: "#64748b"
  secondary-slate-light: "#cbd5e1"
  success-green: "#16a34a"
  warning-orange: "#ea580c"
  error-red: "#dc2626"
  info-cyan: "#0891b2"
  neutral-white: "#ffffff"
  neutral-bg-light: "#f3f4f6"
  neutral-bg-lighter: "#fafafa"
  neutral-text-dark: "#111827"
  neutral-text-medium: "#4b5563"
  neutral-text-light: "#6b7280"
  neutral-border: "#e5e7eb"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.875rem, 5vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-blue}"
    textColor: "{colors.neutral-white}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-blue-dark}"
  button-secondary:
    backgroundColor: "{colors.neutral-bg-light}"
    textColor: "{colors.neutral-text-dark}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.error-red}"
    textColor: "{colors.neutral-white}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.neutral-white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  input:
    backgroundColor: "{colors.neutral-white}"
    textColor: "{colors.neutral-text-dark}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
---

# Design System: SISTEM QC BERKAS

## 1. Overview

**Creative North Star: "The Efficient Operator's Dashboard"**

SISTEM QC BERKAS is a document-focused enterprise application where staff operators process workflows daily: submit documents, review submissions from colleagues, approve or reject with clear rationale. The interface is built for clarity and speed, not decoration. Every pixel serves the operator's workflow. Information hierarchy is strict; secondary details don't compete with primary decisions. The visual language is modern and trustworthy, using established web conventions so operators feel confident moving through the system quickly. The palette is deliberately restrained (one primary blue accent, neutral grays, semantic colors for status) so status-critical information stands out.

This system explicitly rejects booring, lifeless interfaces that drain motivation; instead, breathing room and purposeful typography keep the experience human and inviting. No decorative flourishes, no unclear next steps.

**Key Characteristics:**

- Strict information hierarchy: operator always knows what to do next
- One primary accent color used sparingly (≤10% of any screen) for critical actions
- Semantic status colors (green success, orange warning, red error) never ambiguous
- Generous whitespace and breathing room between sections
- Clear focus indicators for keyboard navigation (operators may move quickly via Tab)
- No animations on critical paths; motion is intentional and brief only where it clarifies state

## 2. Colors

The palette is deliberately restrained: one primary blue accent, a secondary gray for supporting hierarchy, semantic status colors (success, warning, error, info), and a neutral scale for backgrounds, text, and borders. Gray is used structurally, not thematically; all personality comes from the primary accent and semantic colors.

### Primary

- **Enterprise Blue** (#2563eb / `oklch(55.4% 0.168 262.4)`): Primary action buttons, links, active states, and primary focus indicators. Used on ≤10% of any screen so rarity drives attention to the most critical action per page. Hover state darkens to #1e40af (`oklch(46% 0.15 262)`) to signal interactivity without moving colors.

### Secondary

- **Slate Gray** (#64748b / `oklch(53% 0.05 257)`): Secondary buttons, disabled states, supporting text, and less critical metadata. Intentionally muted so secondary content recedes and primary blue stands out.

### Semantic / Status

- **Success Green** (#16a34a / `oklch(53.1% 0.14 142.5)`): Approved documents, successful submissions, completion indicators. Immediately recognizable across all screen readers and color vision types.
- **Warning Orange** (#ea580c / `oklch(62% 0.15 32)`): Under review, pending action, requires attention. Warmth signals "something is happening, not yet resolved."
- **Error Red** (#dc2626 / `oklch(53.5% 0.15 15)`): Rejection, validation failure, critical errors. Must not be the only indicator (always pair with text or icon).
- **Info Cyan** (#0891b2 / `oklch(60.5% 0.15 202)`): Informational messages, status badges, background hints. Distinct from action blue so operators never confuse "read this" with "click this."

### Neutral

- **Pure White** (#ffffff): Card backgrounds, input fields, text input backgrounds, modal windows. Default, safe, and always readable.
- **Light Gray Background** (#f3f4f6 / `oklch(96% 0.007 264)`): Page background, subtle container fills, alternate row backgrounds in tables. Just enough lift to separate from white cards.
- **Lightest Background** (#fafafa / `oklch(98% 0.003 260)`): Body background on full pages. Nearly white but just distinct enough from card white.
- **Dark Text** (#111827 / `oklch(8.9% 0.01 260)`): Primary body text, headings, labels. High contrast (≥12:1 against white) ensures readability on all screens and lighting conditions.
- **Medium Text** (#4b5563 / `oklch(35% 0.04 260)`): Secondary text, muted metadata, helper text. Still ≥4.5:1 contrast against white backgrounds.
- **Light Text** (#6b7280 / `oklch(50% 0.04 260)`): Placeholders, disabled text, tertiary information. Only ever on white or light gray backgrounds; never on colored backgrounds.
- **Border Gray** (#e5e7eb / `oklch(92% 0.006 260)`): Dividing lines, card borders, table row separators. Subtle but present, maintaining visual structure without noise.

### Named Rules

**The One Blue Rule.** Enterprise Blue is the primary accent. It is used on the most important action per page (e.g. "Submit Document", "Approve", "Reject"). Secondary actions are Slate Gray. Accent blue is never used for text body or backgrounds; it lives on buttons, links, and focus indicators only.

**The Semantic Clarity Rule.** Status is conveyed by both color AND icon/text. Never color alone. Green approval, orange pending, red rejection are immediately understandable but always paired with text ("Approved", "Pending Review", "Rejected") and an icon (checkmark, clock, close) so the meaning survives color blindness and screen readers.

## 3. Typography

**Display Font:** Inter (with system-ui, -apple-system, sans-serif fallback)
**Body Font:** Inter (same)
**Mono Font:** (Not specified; when needed, inherit system monospace)

**Character:** Inter is a geometric humanist sans-serif, intentionally approachable and modern. The system avoids decorative or serif fonts; everything defaults to Inter so the interface feels contemporary and operational, not traditional or fussy. The stack includes system fonts so no CDN is required; the interface degrades gracefully if Inter fails.

### Hierarchy

- **Display** (600 weight, clamp(1.875rem, 5vw, 3rem), 1.1 line-height): Page hero titles ("Document Submissions", "QC Dashboard"). Used once or twice per page maximum. Large enough to break up dense pages, but never shouting.
- **Title** (600 weight, 1.5rem, 1.25 line-height): Section headings ("Recent Submissions", "Approval Queue", "Document Details"). Consistent rhythm marker; appears 2-4 times per page.
- **Body** (400 weight, 1rem, 1.6 line-height): Main body text, data descriptions, paragraph content. Line length capped at ~75ch for readability. Generous 1.6 line-height aids scanning and reduces cognitive load.
- **Label** (500 weight, 0.875rem, 1.5 line-height, 0.01em letter-spacing): Form labels, badge text, table headers, metadata. Weight increase (500) signals structural importance despite smaller size.

### Named Rules

**The Clear Hierarchy Rule.** Heading weight always increases with visual importance (body 400 → label 500 → title 600 → display 600). Font size is secondary; weight does the heavy lifting so the text hierarchy survives across all interfaces (emails, PDFs, prints, screens).

**The Breathing Room Rule.** Body text never caps at the full viewport width. Expected reading width is 65–75 characters. Margins and padding prevent long lines that exhaust the eye.

## 4. Elevation

SISTEM QC BERKAS uses shadows to lift cards and modals gently above the page surface, creating visual layers for scanability. Shadows are restrained and ambient, never dramatic. The system does not use drop shadows as interaction feedback; focus indicators and state changes (hover, active) handle that instead. Shadows exist only at rest on elevated surfaces (cards, modals, floating nav).

### Shadow Vocabulary

- **Card Shadow** (`box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)`): Applied to cards and container backgrounds. Creates a 1-2px visual lift. Consistent, ambient, unobtrusive.
- **Modal Shadow** (not yet defined but inferred): Modals sit above the card layer with slightly darker shadow, 2-4px offset. This is future-ready; the system currently uses overlays without explicit modal components yet.

### Named Rules

**The Flat-by-Default Rule.** All surfaces are flat at rest. Shadows appear only on elevated containers (cards, modals). Buttons, inputs, and other controls are flat with color changes for state; they do not lift on hover or focus. This keeps the interface snappy and prevents "shadow clutter" that slows down scanability.

## 5. Components

### Buttons

- **Shape:** Rounded corners (8px border-radius)
- **Primary Button:** Enterprise Blue background (#2563eb), white text, 8px vertical + 16px horizontal padding. On hover, background darkens to #1e40af. On active/press, same background as hover. Focus: 2px solid blue outline, 2px offset. Disabled: background becomes Slate Gray (#64748b), text becomes Light Gray (#6b7280).
- **Secondary Button:** Light Gray background (#f3f4f6), Dark Text (#111827), same padding and radius. On hover, background darkens slightly to #e5e7eb. Disabled state matches Primary.
- **Danger Button:** Error Red background (#dc2626), white text, same padding/radius/hover treatment. Used for destructive actions (delete, reject, close). Never default; always requires secondary confirmation on critical deletions.
- **Outline Button:** Enterprise Blue border (2px), blue text on transparent background, rounded to 8px. Hover: Light blue background (#eff6ff / `oklch(97% 0.04 262)`). Used when an action is available but not the primary path.

**Loading State:** A subtle spinner (text or icon) appears left of button text when async work is in progress. Button is disabled during load to prevent double-submission.

### Inputs / Form Fields

- **Style:** White background (#ffffff), Dark Text (#111827), Border Gray border (1px), 8px border-radius. Padding: 8px vertical + 12px horizontal (same as label size for compact forms). Font size: 1rem.
- **Placeholder:** Medium Gray (#4b5563), 4.5:1 contrast against white. Placeholder text is always present; there is no separate floating label pattern yet.
- **Focus:** 2px solid Enterprise Blue outline, 2px offset (inherited from globals.css :focus-visible rule). No background change; only the outline indicates focus.
- **Error State:** Border becomes Error Red (#dc2626), 2px width. Error message displayed below in Error Red text. Focus outline remains blue even in error state.
- **Disabled:** Background becomes Light Gray Background (#f3f4f6), text becomes Light Gray (#6b7280), border becomes Border Gray (#e5e7eb). Cursor is not-allowed.

### Cards

- **Corner Style:** Rounded corners (8px)
- **Background:** Pure White (#ffffff)
- **Shadow:** Card Shadow (0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06))
- **Border:** 1px Border Gray (#e5e7eb). Separates card from page background subtly.
- **Internal Padding:** 16px (md spacing) by default. Cards with titles have an additional border-bottom dividing the header from content. Header padding: 16px. Content padding: 16px.
- **Title Treatment:** If a card has a title, title is 1.5rem bold (Title font), Dark Text color. Subtitle is 0.875rem, Medium Gray.

### Tables (if used)

- **Header Row:** Background Light Gray (#f3f4f6), Dark Text (#111827), Label font weight. Border-bottom: 1px Border Gray (#e5e7eb).
- **Data Rows:** Alternating white and Light Gray (#f3f4f6) backgrounds for easier scanning. Text: 1rem, Dark Text or Medium Gray for secondary data. Padding: 12px vertical + 16px horizontal.
- **Hover State:** Subtle background tint (Light Gray) on hover for row selection affordance. No color change; background only.
- **Borders:** 1px Border Gray between rows and columns. Keep borders minimal; whitespace and contrast carry structure.

### Navigation (TBD)

Navigation components (sidebar, top bar, breadcrumbs) are scoped for a follow-up design pass. For now, follow Button and Label styles; use Enterprise Blue for active states.

### Status Badges

- **Success Badge:** Success Green background (#16a34a), white text, 4px padding, 4px border-radius, 0.875rem font. Icon (checkmark) left of text.
- **Warning Badge:** Warning Orange background (#ea580c), white text, same padding/radius/font. Icon (warning triangle) left of text.
- **Error Badge:** Error Red background (#dc2626), white text, same styling. Icon (X or alert) left of text.
- **Info Badge:** Info Cyan background (#0891b2), white text, same styling. Icon (info circle) left of text.

Badges are never the sole indicator of status. Always pair with text description or in a column labeled with the status name.

## 6. Do's and Don'ts

### Do:

- **Do** use Enterprise Blue (#2563eb) on the primary action only. Reject, Approve, Submit, Continue—pick one per page and make it blue.
- **Do** pair every status color (green, orange, red, cyan) with an icon and text label. Color blindness and screen readers require redundancy.
- **Do** maintain ≥4.5:1 contrast on all body text and interactive elements. Verify against backgrounds; avoid Light Gray text on Light Gray backgrounds.
- **Do** use Slate Gray (#64748b) for secondary actions and supporting UI. It recedes without disappearing.
- **Do** apply focus outlines consistently (2px solid blue, 2px offset) via :focus-visible. Operators navigate by keyboard; focus states are non-negotiable.
- **Do** keep button and input padding symmetric (8px vertical, 12-16px horizontal). Consistency reduces cognitive load.
- **Do** use Card Shadow on elevated surfaces only; keep the rest flat. This reduces visual noise and speeds up scanning.
- **Do** write clear, specific microcopy. Labels should be nouns or short verb phrases ("Submit Document", not "Go"); error messages should state what went wrong and how to fix it.
- **Do** test at real text sizes. 1rem body on a large monitor and small mobile screen should both hit 65–75 characters per line. Use responsive padding and clamp() for fluid scales.

### Don't:

- **Don't** use color alone to indicate status. Always pair with text and/or icon so color-blind operators and screen readers receive the same information.
- **Don't** use side-stripe borders (border-left > 1px) as colored accents on cards or alerts. Rewrite with full borders, background tints, or leading icons instead.
- **Don't** apply gradient text, glassmorphism, or other decorative effects. SISTEM QC BERKAS is an operational tool, not a design showcase.
- **Don't** make UI that is "booring" or lifeless. Breathing room, careful typography, and restrained color use keep the interface human and inviting without decoration.
- **Don't** use more than two accent colors on a single screen (typically blue for primary action and one semantic color for status). Extra accents compete and slow down decision-making.
- **Don't** disable form inputs as a state; use read-only or hidden fields instead. Disabled inputs are hard to scan and screen readers often skip them.
- **Don't** add animations to critical paths (submission, approval buttons, status transitions). Only animate secondary affordances (loading spinners, hover states on non-critical links).
- **Don't** rely on tooltips or hover states as the primary instruction. All required information should be visible at rest. Hover states are enhancements, not the first line of help.
- **Don't** increase heading or button text size just to "make it pop." Hierarchy comes from weight and positioning, not size inflation. Respect the 1.5rem title, 1rem body scale.
- **Don't** use placeholder text as a substitute for form labels. Always have a visible label above the input so screen readers and keyboard operators know what to enter.
