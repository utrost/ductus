# Roadmap

Ductus should stay small until the movement model proves useful. The next work is mostly reference quality, device testing, and better feedback. More UI can wait.

## Phase 0: public prototype

Status: mostly done.

Goal: make the current web prototype easy to try and easy to inspect.

Done:

- Static app shell
- Offline-capable PWA wiring
- One built-in Kurrent `n` reference
- Stylus/mouse stroke capture
- Reference JSON load/save
- Attempt export
- Five-part scoring: form, order, direction, pressure, rhythm
- Dependency-free regression tests
- GitHub Actions CI
- GitHub Pages deployment
- README and public project note

Remaining:

- Add a short in-app explanation of each score
- Add one or two small sample references beyond `n`
- Add a manual browser/device test checklist

Exit criterion:

- A new visitor can open the app, draw the built-in glyph, understand the score bars, and save a reference JSON without reading the source.

## Phase 1: reference authoring

Goal: make it easier to create reference glyphs that are actually useful.

Planned work:

- Add a reference metadata panel: script, glyph, hand, nib/pen, notes
- Make baseline and x-height editable in author mode
- Show per-stroke hints while practicing
- Add stroke numbering and direction arrows to the reference ghost
- Add a review view before adopting an attempt as reference
- Add import/export examples under `examples/`

Exit criterion:

- A small reference set can be authored, reviewed, saved, and loaded again without editing JSON by hand.

## Phase 2: device and pressure testing

Goal: find out what the browser gives us on real hardware.

Planned work:

- Test Android tablet + stylus pressure
- Test iPad/Safari behavior
- Test desktop drawing tablet behavior
- Record pressure ranges and event sampling rates
- Add an in-app pressure calibration strip
- Decide whether pressure scoring should be optional per reference

Exit criterion:

- The app can tell the user when pressure data is missing or unreliable, instead of quietly scoring nonsense.

## Phase 3: feedback quality

Goal: turn numbers into practice feedback.

Planned work:

- Add per-stroke mismatch markers
- Highlight reversed strokes
- Show the closest reference stroke for each attempt stroke
- Split pressure feedback from form feedback visually
- Add short plain-language feedback for common failure cases
- Save attempt history locally, probably in IndexedDB

Exit criterion:

- A bad attempt points to the part that needs practice, not just to a low score.

## Phase 4: reference set

Goal: build a small useful reference library.

Planned work:

- Expand Kurrent samples
- Add basic Latin pen-control exercises
- Add simple warm-up strokes: hairline, downstroke, compound curve
- Document how references were authored
- Keep reference JSON files in the repo

Exit criterion:

- Ductus can be used for a short practice session without making a custom reference first.

## Phase 5: native app decision

Goal: decide whether the original Android/Kotlin direction is still needed.

Questions:

- Does browser pressure data work well enough?
- Is stylus latency acceptable?
- Does PWA install behavior feel good enough for practice?
- Would native Android give meaningfully better MotionEvent access?
- Is the scoring model worth carrying into a native app?

Exit criterion:

- Either keep Ductus as a web/PWA project, or start a native build with specific reasons instead of vague platform anxiety.

## Non-goals

- Cloud accounts
- Shared reference marketplace
- Social scoring
- AI handwriting judgement
- Perfect OCR-style glyph recognition
- A framework rewrite for its own sake
