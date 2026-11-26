# DESIGN.md

Visual rules for CodeWithMixx. Read this before writing or changing any template, component CSS or Tailwind class string. It describes how things should look; `CLAUDE.md` covers how the code is written.

The site should feel personal and calm, like one instructor's own site, not a SaaS landing page. When a rule here conflicts with what a shared component already does, the shared component wins.

## Where styles live

- `src/styles.css` — the only global stylesheet: font import, `@theme` (`--breakpoint-3xl: 140rem` and the modal animations `animate-backdrop-in` / `animate-modal-in`), scrollbar colors, and the custom utilities `transition-200`, `action-link` and `no-spinner` (hides the arrows of a `type="number"` input). Every modal uses `animate.enter="animate-backdrop-in"` on the backdrop and `animate.enter="animate-modal-in"` on the panel; don't redeclare those keyframes in component CSS. New design tokens go in `@theme` here, nowhere else. Custom utilities are declared with `@utility name { ... }` (Tailwind v4), not as classes inside `@layer utilities`: only `@utility` registers them, so they work with `@apply` and variants (`hover:`, `md:`).
- There are no custom color tokens. Colors are the default Tailwind palette used by name (`bg-emerald-950`), so the values below are rules of use, not definitions.
- Templates carry the styling as Tailwind utilities. A component's `.css` file is only for what utilities cannot express (pseudo-elements, keyframes, native `range` styling, state classes), as in `layouts/site/navbar/navbar.css`. Host-element styles are utilities too: `host: { class: 'flex-1' }` in the component metadata, never a `:host` rule or an empty `.css` file. In those files use theme variables (`var(--color-amber-500)`), never raw hex.
- Shared components build variant classes in TypeScript via `computed()` (`shared/components/button/button.ts`). A new look for a button, card or input is a new variant there, not a one-off class string in a feature template.
- No arbitrary values (`text-[17px]`, `bg-[#0f3]`, `p-[13px]`) when a scale step exists. Arbitrary values are for real layout math only (grid templates, container-query font sizing as in the hero code window).

## Color

| Role                                                     | Classes                                                                                                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page and chrome surfaces (navbar, sidebar, section base) | `bg-emerald-950`                                                                                                                                                      |
| Panels and cards                                         | `bg-emerald-900`, or `bg-emerald-900/80`, `bg-emerald-950/80` over the fog                                                                                            |
| Inputs and inset areas                                   | `bg-emerald-800`, `bg-emerald-900/80`                                                                                                                                 |
| Headings                                                 | `text-white`                                                                                                                                                          |
| Body text                                                | `text-emerald-100`, `text-emerald-50/90` for lead paragraphs                                                                                                          |
| Muted text                                               | `text-emerald-100/70`, then `/50`                                                                                                                                     |
| Highlight inside text, icons                             | `text-emerald-300`, `text-emerald-400`                                                                                                                                |
| Accent                                                   | `amber-500` (logo "Code", nav link hover underline), `amber-400` (key numbers), `yellow-600` (main CTA fill), `yellow-100`–`yellow-400` (accent text and hover fills) |
| Danger and errors                                        | `red-400` on dark, `red-600` on light                                                                                                                                 |

- Amber and yellow together are the one warm accent; either is fine. The accent is scarce: one or two accented things per viewport (the main CTA, a key number, a hovered nav link). If everything is accented, nothing is.
- The main CTA is `app-button variant="secondary"`; `primary` (emerald) is the quieter action next to it. One main CTA per section.
- Sky, violet, orange, pink and purple exist only as data categories (stats icons, analytics cards, syntax colors in the hero code window). Never use them for decoration, backgrounds or accents.
- Text on a dark surface must stay readable: do not go below `/50` opacity for anything a person needs to read.

## Typography

- One font: Outfit (set on `body`). `font-mono` only for actual code.
- Weights: `font-bold` for headings and large numbers, `font-semibold` for labels, links and buttons, normal for paragraphs.
- Page title (one `h1` per page): `text-5xl sm:text-6xl lg:text-7xl 3xl:text-8xl`. Section titles step down from there (`text-3xl` to `text-5xl`). Lead paragraph: `text-lg sm:text-xl lg:text-2xl`. Body: `text-base`, small print `text-sm`.
- Limit paragraph width (`max-w-xl`, `max-w-2xl`) so lines stay readable.
- Emphasis inside a heading is a color change on a `span` (`text-emerald-300`), not a gradient, underline or different font.

## Layout

- Section container: `mx-auto w-full max-w-7xl px-6 lg:px-10 3xl:max-w-[110rem]`.
- The site navbar is `fixed`, so the first section of a page starts with `pt-28 lg:pt-32`.
- Mobile first. Breakpoints in use: `sm`, `md`, `lg`, `xl` and the custom `3xl` (2240px) for very wide screens, where type and spacing scale up instead of leaving the content tiny in the middle.
- Text blocks are left-aligned by default. Center only short standalone items (a row of stats, a closing call to action).
- Give sections different shapes. Do not repeat "centered title, subtitle, three equal cards" down the page.

## Shape, depth and motion

- Radius: `rounded-lg` by default, `rounded-full` for icon buttons, pills, avatars and the circular photo cluster (one large circle, one small circle overlapping its edge, both with a `border-8` in the section's background tone, and a flat `rounded-lg` panel tucked under the large circle that holds the section's supporting button, as in `about-services.html`), `rounded-2xl` only for one large showcase panel per section.
- Depth: `shadow-lg` by default, `shadow-2xl` for a large floating panel. Surfaces are separated by background tone and shadow first, a quiet border only where that is not enough.
- `backdrop-blur-*` only on translucent panels that sit over the Vanta fog, where there is something to blur.
- Scrolling to a section on the same page (navbar links, a table of contents) is smooth; moving to another page jumps to the top. `SiteLayout` switches this with the `smooth-scroll` class on `html`, and it is off under `prefers-reduced-motion`.
- Transitions: `transition-200`. Pressable things get `active:scale-95`; hover is a tone or opacity change.
- Longer or custom animations go in component CSS and honor `prefers-reduced-motion` (see `navbar.css`).
- The Vanta fog is the only ambient animation. It is set up in `afterNextRender` and always sits under the darkening overlay used in `hero.html`.

## Components

- Buttons and button-looking links are always `app-button`. Variants: `secondary` main CTA, `primary` supporting action, `danger` destructive, `ghost` outlined on dark, `ghost-light` and `ghost-danger` outlined on light.
- Before building a search field, filter, sort menu, slider, skeleton, spinner or stat tile, use the one in `shared/components/`.
- Modals are `app-modal-overlay`: `isOpen`, `title`, optional `subtitle`, `isLoading` (skeleton in place of the title) and `size` (`sm`, `md` default, `lg`, `xl`, `2xl`), `closed` on backdrop or X click. Content goes into three slots: `[modalHeader]` right under the title row (summary tiles of the payment modals), the default slot for the body, and `[modalActions]` for the buttons, right-aligned in a full-width row (`Odustani` as `secondary`, the confirm button as `primary`); a single `<div modalActions class="flex w-full justify-between">` puts extra controls on the left, as in the subtract payment modal. A modal mounted by the parent through `@if`/`@switch` passes `[isOpen]="true"`.
- Every `app-filter-menu` goes inside `app-filter-container` (`variant="blue"` on sky cards): inline from `xl` up, one round filter button that opens the filters in a modal below `xl`. Inside the open modal the filters switch to the `light` variant on their own; it is not set by hand.
- Dates shown as a block next to an item (next class, upcoming list) use `app-date-card`: `full` is the light tile with short month on top, day number in the middle and weekday below (one highlighted date); `compact` is short weekday in amber over `dd.MM.` in muted text (rows of a list). Formatting goes through `Intl` with the `locale` input (`sr-Latn-RS` by default).
- Loading states use `app-skeleton` in the shape of the final content, not a spinner in an empty box.
- List item cards inside a panel (recent payments, open balances, active projects, upcoming classes) are a filled `bg-emerald-900/80 rounded-lg` with no border and follow one text hierarchy: the item title is `text-emerald-100 font-semibold`; an optional secondary line right under it (e.g. the subject) is `text-emerald-100/70` without an icon; metadata (dates, times, reservation number, type) is led by a small `text-amber-300` icon, its label ("Rok", "Rezervacija", "Ukupno") is `text-amber-300` and its value is `font-semibold text-emerald-100` (a piece without a value, like the type, stays all `text-amber-300`); the same split applies to the `border-t` metadata footer of the admin cards; the one key value of the item (an amount, days left, what is still owed) is `text-emerald-300 font-bold`, or `text-red-400` when it signals a problem. Status goes into a `rounded-full` badge on the right. Panel-level accents (links like "Svi projekti", the main amount in a stat tile) stay `amber-400`.
- Admin cards and form sections are `app-panel`: `title` is the heading, an optional `count` pill sits next to it, an optional `description` is the one-line `text-sm text-emerald-300` hint under the title, and controls on the right go into the `panelAction` slot. Do not rebuild the panel shell (`bg-emerald-950/80 rounded-lg shadow-lg p-4`) by hand.
- A link or text action on the right of a panel header (the `panelAction` slot of `app-panel`, e.g. "Svi projekti") uses the `action-link` utility: `text-sm text-amber-400`, opacity on hover and press. Do not rebuild it from separate classes.
- Icons come from `@ng-icons` (Font Awesome solid), registered per component.

## What not to do

These are the habits that make a page look machine-made. They are rules, not suggestions.

- **Gradients.** No gradient text, gradient buttons, gradient borders or multi-hue gradients. The only gradients allowed are the ones that already exist: the darkening overlay above the fog, and same-hue tonal fills (`from-emerald-950 to-emerald-900`) on existing admin cards. A new section gets a flat surface.
- **Borders everywhere.** Borders are allowed, in moderation. Background tone, spacing and shadow do the separating first; a border is added where it carries meaning (an outlined control such as the ghost button or round icon button, a state like active, selected or error, a divider inside a list or group). Not every card, panel, section, input and image gets an outline, and nested bordered boxes are out. Keep borders quiet: `border` or `border-2` at most, in a tone close to the surface (`border-emerald-700/40`, `border-white/10`), with stronger tones (`border-emerald-400`, `border-amber-500`, `border-red-400`) reserved for controls and states.
- **Glow.** No colored or neon shadows, no glowing rings around cards or icons. Do not add new ones beyond the existing nav-link underline.
- **Decoration.** No blurred color blobs, floating shapes, grid or dot patterns, noise overlays or sparkles behind content.
- **Emoji.** Never as icons, bullets or in headings.
- **Badge above the title.** No pill or uppercase tracked "eyebrow" label above every heading.
- **Icon tiles.** No grid of identical cards with an icon in a tinted circle, a title and two lines of text as the default way to present features on the public site.
- **Hover lift.** No `hover:scale-105`, `hover:-translate-y-1` or shadow growth on cards. Only real controls react to hover.
- **Glass everywhere.** No translucent blurred panel over a flat background.
- **Radius and shadow inflation.** No `rounded-3xl` cards, no stacking of shadow, ring and border on one element.
- **Off-palette accents.** No indigo, purple, blue or pink accents, and no second accent family next to amber/yellow.
- **Invented content.** No made-up numbers, testimonials, logos or reviews. If real content is missing, ask or leave a clearly marked placeholder.
- **Filler copy.** No generic marketing lines ("Otključaj svoj potencijal", "Sve na jednom mestu"). Copy is concrete, in Serbian, informal "ti" (see "UI copy" in `CLAUDE.md`).
