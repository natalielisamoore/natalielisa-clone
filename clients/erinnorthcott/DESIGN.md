# Erin Northcott — Homepage Design Spec
_2026-08-09 · client site under natalielisa.com/clients/erinnorthcott (portable to erinnorthcott.com)_

## The feeling
Arriving somewhere trustworthy, original, and alive. Every decision serves that first. A single scroll-driven journey through a sky: **sunrise → golden hour → sunset → midnight stars.**

## Core mechanic — the sky (scroll gradient: light → dark)
One `position: fixed` sky layer whose gradient `sky.js` interpolates between four "moments" as you scroll — **sunrise → golden hour → sunset → midnight** — so the page turns from light at the top to deep dark at the bottom, tied to scroll position. `sky.js` also feeds `--night` so the stars fade in over the night section.

_History: a fixed sunset photograph was tried (2026-08-09) then reverted — the static image lost the temporal "journey" the story needs. Rose petals were also removed at Natalie's request._

## Layer stack (back → front)
1. **Sky** — fixed, scroll-interpolated gradient (light → dark). Sunrise/golden now carry **baby pink** (whisper rose) → peach → gold, not just peach.
2. **Horizon** — fixed glowing light-band; intensifies into the night (`--night`)
3. **Motes** (`motes.js`) — ambient celestial dust drifting site-wide; the "you're inside a space" unifier
4. **Stars** — fixed canvas; denser now; fades in for the night; white + gold, larger ones glow
5. **Hero clouds** — soft cloud banks on BOTH sides of the sunrise hero, gently parting (enter between them)
6. **Content** — four sections, fade-up on scroll (IntersectionObserver)
7. **Vignette** — soft portal edge-frame; **Arrival veil** (`.enter-veil`) dissolves on load = crossing a threshold

## Palette
- White `#FFFFFF` — primary canvas
- Warm gold `#C9A84C` — accent throughout
- Whisper rose `#F5C6C6` — softness
- Earth clay brown `#8B5E3C` — grounding
- Midnight blue `#0a0a1a` — the night sky

## Sky moments (gradient keyframes, top→bottom of scroll)
1. **Sunrise** — warm gold/rose wash over white
2. **Golden hour** — luminous gold + clay
3. **Sunset** — rose → clay → dusk
4. **Midnight** — deep `#0a0a1a`, stars visible

## Sections (top → bottom)
1. **SUNRISE (hero)** — "Erin Northcott" large, short tagline + handwritten note.
2. **HOOK — archival threshold** (`.section--hook`) — the cinematic hook line between hero & story. Warm sun-faded; thin slide-mount frame, two faintly-spinning cassette reels, a handwritten "no. 01" corner label, mono "FROM THE ARCHIVE" eyebrow. Line 1 handwritten (Caveat): *"Boxes of cassettes & a request…"*; line 2 serif: *"a dying wish that became an HBO film."* (HBO upright = quietly important). Emotional doorway into Golden Hour.
3. **GOLDEN HOUR** — Daniel & the story; asymmetric film-frame grid (real Daniel/HBO image) + bio.
4. **SUNSET — The Becoming** — how Inner Ceremonies came to be; the eleven-year transformation.
5. **NIGHT SKY** — stars arrive; minimal audio player (placeholder silent track). On play, gold line fades in: *"Mommy, the stars are kissing me." — Daniel Northcott*
6. **CLOSING benediction** (`.section--close`) — *"Our story never ends."* (glowing cream, "ends." muted rust) on the deep night with horizon glow + "— in Daniel's words" handwritten. The final frame.

## Animations
- Concentric ripple effect on scroll-triggered elements
- Twinkling stars, breathing glow (`stars.js`)
- Gold text fade-in at bottom of night sky
- Fade-up on all content entering viewport (`reveal.js`)

## Creative pass — asymmetry + film (2026-08-09)
Fixing "flat/boring" (every section was centered + no imagery). **Golden Hour redesigned as the template:** asymmetric grid — a **film still** (left) treated as a warm duotone inside a 16mm-style frame with a mono caption (`DANIEL NORTHCOTT · 16MM · 00:11:04`), body text anchored off-center (right), and an **oversized pull-quote** (`Our story never ends.`) that bleeds off the edge. Plus a **film-grain** overlay site-wide (`.grain`, inline SVG feTurbulence, soft-light). Image is a **placeholder** (`images/daniel-still-PLACEHOLDER.jpg`, grayscale bokeh) — swap in a real still of Daniel's footage. NEXT: apply the same asymmetric/scale-contrast treatment to Sunset & bring imagery throughout; other creative options on the table: cinematic audio climax (audio-reactive stars), concentric-circles motif (Daniel's orbicularity), scroll parallax/pinning, cursor aura.

## Documentary-feel pass (2026-08-09) — the strongest direction
Erin wants the site to feel like the **Daniel HBO documentary** / an **ethereal analog film archive**: grainy, filmy, handwritten, sun-faded, imperfect, sacred. Reference screenshots = the trailer's title cards (heavy grain, dust/scratches, brush handwriting with a RED accent word + scrawled underline, film-edge sprocket codes "16A/KODAK 400/frame numbers"). Also loves noartmusic.com (corner crop-marks, full-bleed film) and jayshetty.me (cherry-pick: centered wordmark nav, HBO/press credibility band, cinematic portrait of Erin — portrait still needs a photo from her).

Implemented: **Caveat** handwriting font (archival hand) + **oxidized brick-red** accent `--accent-red:#b23a2e` (the film's red, kept on-palette, not neon). Fixed texture layers: heavier flickering **grain**, **light leaks** (warm, breathing), **dust specks + hairline scratches**, **film-edge markings** down both sides (`.filmedge`, hidden <720px). Handwritten accents: `.hand-underline` (SVG red scrawl) under "first light"; `.hero__note` ("est. from a box of old reels — at sunset"); pullquote "ends." in red + `.pullquote__hand` caption "— in Daniel's words". **Still TODO from Jay Shetty list: centered wordmark nav, HBO credibility band, cinematic Erin portrait (needs photo).**

## Navigation
Fixed top, semi-transparent. "Erin Northcott" left; links right — Inner Ceremonies · Daniel & The Film · Podcast · Collaborate. **Links are non-clickable stubs for now.** **Dusk-adaptive:** sky.js sets `--dusk` (ramps 0→1 from ~32% scroll); nav text mixes ink→ivory and the bar deepens to a dusk overlay via `color-mix()` so it stays readable on dark sections.

## Footer
Quiet archival close on the deep night (below the closing benediction, flows continuously — no gap). Wordmark + "Somatic guide · Storyteller" + handwritten "Made in devotion."; Explore column (4 page stubs); Connect column (Instagram/Email — **placeholder stubs, need Erin's real handles**) + "Daniel — an HBO Original" badge; base bar "© 2026 Erin Northcott / Reel end · 16A".

## Clickable film
Golden Hour's Daniel/HBO image is now a link (`.filmframe__link`) with hover zoom + "Watch the trailer →" cue. **href is a placeholder `#` — needs the real trailer/inner-page URL.**

## Scroll choreography (polish pass 2026-08-09)
Removed blank dark bands: night section min-height 120vh→100vh with padding; "Our story never ends." merged INTO the night section right under the audio/starline (was a separate 100vh section) so it reads as one held moment. Hook = full-height centered threshold, text never clipped, cassette reels removed (Natalie: "tacky").

## Typography (updated 2026-08-09)
Editorial type system inspired by **sinceyouarrived.world/sky**:
- **Fraunces** (Google Fonts) — display serif for masthead, hero name, section titles, pullquote, night intro, starline. Masthead + taglines + section titles set **italic**.
- **JetBrains Mono** (Google Fonts) — all labels: eyebrows, nav links, scroll cue, player captions/time, attribution. Uppercase, letterspaced.
- **Arial** — body/lede.
Loaded via `<link>` to Google Fonts in `index.html`.

## Bold accents (from risingtemps.com)
- **Glowing horizon light-band** — fixed `.horizon` layer, a warm radial glow across the mid-line that intensifies into the night via `opacity: calc(.16 + var(--night) * .62)`.
- **Mono chapter numerals** — section eyebrows numbered `01 — Golden Hour`, `02 — The Becoming`, `03 — Night Sky` (the narrative's three movements). Hero eyebrow flanked with em-dashes: `— SOMATIC GUIDE · STORYTELLER —`.

## File structure
```
clients/erinnorthcott/
├── index.html
├── style.css
├── sky.js  stars.js  reveal.js
├── images/ videos/ audio/ fonts/   (placeholders)
└── DESIGN.md
```
All paths relative → identical behavior at `/clients/erinnorthcott/` and a future `erinnorthcott.com`.

## Assets
Placeholders for now: neutral placeholder images, a short **silent** audio file so the player fully works. Clearly labeled; real files drop in with no code changes.
