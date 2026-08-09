# Erin Northcott — Homepage Design Spec
_2026-08-09 · client site under natalielisa.com/clients/erinnorthcott (portable to erinnorthcott.com)_

## The feeling
Arriving somewhere trustworthy, original, and alive. Every decision serves that first. A single scroll-driven journey through a sky: **sunrise → golden hour → sunset → midnight stars.**

## Core mechanic — continuous sky
One `position: fixed` full-viewport sky layer. `sky.js` reads scroll progress (0→1) and interpolates the gradient between four "moments," so the sky is seamless and continuous, tied to scroll position. Sections sit transparent on top.

## Layer stack (back → front)
1. **Sky** — fixed, scroll-interpolated gradient
2. **Stars** — fixed canvas; fades in near the night section; white + gold, larger ones glow and breathe
3. **Petals** — fixed; rose petals drift down on load, gently thinning
4. **Content** — four sections, fade-up on scroll (IntersectionObserver)

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
1. **SUNRISE (hero)** — "Erin Northcott" large (Georgia), short tagline, petals falling. Full height.
2. **GOLDEN HOUR** — Daniel & the story; bio + centered pullquote *"Our story never ends."*
3. **SUNSET — The Becoming** — how Inner Ceremonies came to be; the eleven-year transformation.
4. **NIGHT SKY** — stars arrive; minimal custom audio player (placeholder silent track in `audio/`). On play, gold line fades in slowly at bottom: *"Mommy, the stars are kissing me." — Daniel Northcott*

## Animations
- Rose petals falling on load (`petals.js`)
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
├── sky.js  stars.js  petals.js  reveal.js
├── images/ videos/ audio/ fonts/   (placeholders)
└── DESIGN.md
```
All paths relative → identical behavior at `/clients/erinnorthcott/` and a future `erinnorthcott.com`.

## Assets
Placeholders for now: neutral placeholder images, a short **silent** audio file so the player fully works. Clearly labeled; real files drop in with no code changes.
