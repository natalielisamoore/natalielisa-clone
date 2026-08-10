# Erin Northcott — Homepage Design Spec
_2026-08-09 · client site under natalielisa.com/clients/erinnorthcott (portable to erinnorthcott.com)_

## The feeling
Arriving somewhere trustworthy, original, and alive. Every decision serves that first. A single scroll-driven journey through a sky: **sunrise → golden hour → sunset → midnight stars.**

## Core mechanic — the sky (scroll gradient: light → dark)
One `position: fixed` sky layer whose gradient `sky.js` interpolates between four "moments" as you scroll — **sunrise → golden hour → sunset → midnight** — so the page turns from light at the top to deep dark at the bottom, tied to scroll position. `sky.js` also feeds `--night` so the stars fade in over the night section.

_History: a fixed sunset photograph was tried (2026-08-09) then reverted — the static image lost the temporal "journey" the story needs. Rose petals were also removed at Natalie's request._

## Layer stack (back → front)
1. **Sky** — fixed, scroll-interpolated gradient (light → dark)
2. **Stars** — fixed canvas; fades in near the night section; white + gold, larger ones glow and breathe
3. **Content** — four sections, fade-up on scroll (IntersectionObserver)

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
1. **SUNRISE (hero)** — "Erin Northcott" large (Georgia), short tagline. Full height.
2. **GOLDEN HOUR** — Daniel & the story; bio + centered pullquote *"Our story never ends."*
3. **SUNSET — The Becoming** — how Inner Ceremonies came to be; the eleven-year transformation.
4. **NIGHT SKY** — stars arrive; minimal custom audio player (placeholder silent track in `audio/`). On play, gold line fades in slowly at bottom: *"Mommy, the stars are kissing me." — Daniel Northcott*

## Animations
- Concentric ripple effect on scroll-triggered elements
- Twinkling stars, breathing glow (`stars.js`)
- Gold text fade-in at bottom of night sky
- Fade-up on all content entering viewport (`reveal.js`)

## Navigation
Fixed top, semi-transparent (sky shows through). "Erin Northcott" left; links right — Inner Ceremonies · Daniel & The Film · Podcast · Collaborate. **Links are non-clickable stubs for now** (homepage built first; inner pages later).

## Typography
Placeholder: Georgia headings, Arial body. Swappable later via `fonts.css`.

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
