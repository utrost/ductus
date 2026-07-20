# Ductus

Ductus is an offline, stylus-first calligraphy trainer. It does not ask whether the final drawing looks like a reference image. It asks whether the character was *written the same way*: stroke order, stroke direction, pressure modulation, rhythm, and path form.

The first implementation is a **static web/PWA prototype** in the same spirit as Tracer: no backend, no dependencies, no account, no network services. It runs locally from `index.html` and can be installed as a PWA when served over HTTPS or `localhost`.

## Current status

Implemented now:

- Single-page web app in `index.html`
- PWA manifest, service worker, and install icons
- Mobile-responsive layout
- Built-in Kurrent `n` sample reference
- Stylus/mouse stroke capture with pressure
- Reference JSON load/save
- Attempt JSON export
- Author mode: adopt current attempt as a new reference
- Practice mode: score attempt against reference
- Five independent scoring dimensions:
  - form
  - order
  - direction
  - pressure
  - rhythm
- Dependency-free Node regression tests
- GitHub Actions CI and Pages deployment workflow

Still prototype / not yet done:

- Real Android hardware pressure calibration
- Full Kurrent reference set
- Robust authoring review UX
- Long-term local progress tracking
- Deep accessibility work for the drawing surface

## Try it locally

```sh
npm test
npm run serve
```

Then open:

```text
http://localhost:8000/
```

You can also open `index.html` directly from disk, but service worker/PWA install behavior is browser-dependent for `file://` pages.

## Usage

1. Open Ductus.
2. Draw the sample glyph with a stylus or mouse.
3. Click **Score**.
4. Read the five separate bars instead of a single total score.
5. Use **Clear** or **Undo** and try again.
6. Switch to **Author** mode to draw a new reference and click **Adopt attempt as reference**.
7. Save the reference JSON for later reuse.

## Why not one total score?

A single score hides the useful information. A glyph can have good form but wrong stroke order. It can be written in the right place but backward. It can match the path while completely missing pressure modulation.

Ductus therefore reports five independent dimensions:

| Dimension | Question | Prototype metric |
|---|---|---|
| Form | Is the path in the right place? | DTW over arc-length-resampled points |
| Order | Were strokes made in the reference order? | Stroke assignment vs drawn order |
| Direction | Was each stroke drawn the right way? | Tangent dot product |
| Pressure | Does pressure swell/fade in the right place? | Pearson correlation over resampled pressure |
| Rhythm | Was the motion confident or hesitant? | Velocity variance heuristic |

## Reference JSON

A reference is a plain JSON file:

```json
{
  "script": "kurrent",
  "glyph": "n",
  "canvas": { "width": 1000, "height": 1000, "baseline": 700, "xHeight": 400 },
  "strokes": [
    {
      "index": 0,
      "hint": "Aufstrich dünn, erst im Abstrich Druck geben.",
      "points": [
        { "x": 200, "y": 700, "p": 0.2, "t": 0.0 },
        { "x": 260, "y": 430, "p": 0.3, "t": 0.5 },
        { "x": 430, "y": 700, "p": 0.85, "t": 1.0 }
      ]
    }
  ]
}
```

Points are interpreted as normalized reference-space coordinates. The scorer resamples paths by arc length, not by time, so form and pressure can be compared independently from drawing speed.

## Architecture

The prototype keeps the distribution small:

```text
.
├── index.html                 # App shell, CSS, UI, drawing, scorer
├── manifest.webmanifest       # PWA metadata
├── sw.js                      # Offline app-shell cache
├── icons/                     # SVG + PNG install icons
├── tests/ductus-core.test.cjs # Headless regression tests
└── .github/workflows/         # CI and optional GitHub Pages deploy
```

Runtime subsystems:

1. **Stroke capture** — pointer events; accepts pen and mouse, ignores touch.
2. **Reference model** — script/glyph/canvas/strokes JSON.
3. **Scoring core** — resampling, DTW, greedy stroke matching, direction, pressure, rhythm.
4. **Canvas renderer** — reference ghost, baseline/x-height guide, attempt strokes.
5. **PWA shell** — manifest, icons, service worker cache.

## Non-negotiables from the original concept

- Offline-first.
- No accounts.
- No analytics.
- No cloud sync.
- No network dependency for the app logic.
- Local JSON files remain the source of truth.

## Relationship to the Android idea

The original concept targeted Android/Kotlin for direct `MotionEvent` access. This web/PWA version is a faster prototype of the interaction model and scoring pipeline. It is useful for validating references, UI language, and scoring behavior before committing to a native Android build.

The web prototype cannot answer every hardware question. Real device work is still needed for:

- pressure range and pressure levels
- stylus latency
- browser pressure behavior on Android/iPad
- whether rhythm scoring survives real sampling jitter

## Development

Run tests:

```sh
npm test
```

Serve locally:

```sh
npm run serve
```

The tests intentionally avoid external dependencies. They load the inline app script in a Node VM with a mocked DOM/canvas and verify PWA wiring plus scoring behavior.
