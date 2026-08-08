# Ductus

Ductus is an offline calligraphy trainer for practicing ductus: the movement behind a written form.

It does not try to decide whether the final drawing looks nice. It compares how a glyph was written: stroke order, stroke direction, path form, pressure change, and rhythm. That is the useful part if the goal is practice rather than image matching.

The current version is a static web app and PWA. No backend. No account. No analytics. It can run from a local file for quick tests, or from GitHub Pages when installed as an app.

- App: <https://simiono.com/ductus/>
- GitHub Pages mirror: <https://utrost.github.io/ductus/>
- Source: <https://github.com/utrost/ductus>
- Roadmap: [docs/roadmap.md](docs/roadmap.md)
- Device findings: [docs/device-testing-findings.md](docs/device-testing-findings.md)
- First calibration batch: [docs/calibration-2026-08-05-firefox-android.md](docs/calibration-2026-08-05-firefox-android.md)
- Manual test checklist: [docs/manual-device-test-checklist.md](docs/manual-device-test-checklist.md)
- License: MIT

## Current status

Ductus is a prototype. It is usable enough to test the idea, not finished enough to be trusted as a teacher.

Implemented now:

- Single-page app in `index.html`
- PWA manifest, service worker, and install icons
- Mobile-responsive layout
- Hand/group/glyph practice chooser with first hand: Kurrent Basic
- Practice guidance panel that explains what to notice for each starter glyph
- Four built-in references grouped as warm-ups and lowercase stems: Kurrent `n`, hairline, downstroke, compound curve
- Stylus and mouse stroke capture
- Pressure capture where the browser/device exposes it
- Optional `Show pressure` view with pressure-based stroke thickness
- Practice mode with scoring
- Author mode for turning an attempt into a reference
- Reference JSON load/save with hand/tool/notes metadata
- Attempt `.txt` export for mobile sharing
- Five scoring dimensions: form, order, direction, pressure, rhythm
- Confidence labels for pressure, rhythm, order, and partial stroke-count mismatches
- Pointer diagnostics that separate in-stroke sampling gaps from inter-stroke pauses
- Attempt `.txt` exports include browser/device context, app settings, score output, diagnostics, pressure profile summaries, and raw strokes for cross-browser testing
- Plain-language pressure hints for hairline, compound curve, and heavy Kurrent second strokes
- Cross-score feedback when pressure is plausible but form/path placement is poor
- Dependency-free Node regression tests
- GitHub Actions CI
- GitHub Pages deployment

Known limits:

- Built-in references are grouped into a first starter hand, but the content is still mostly calibration samples rather than a real hand/glyph curriculum.
- Pressure behavior depends on browser, hardware, stylus, and grip; thresholds now use the first Android Firefox calibration batch but still need more devices.
- The pressure view makes raw pressure visible, but the app still needs better per-stroke mismatch markers.
- Authoring a good reference still needs judgement and a review step before adoption.
- There is no local progress history yet.
- Accessibility around the drawing surface needs work.

## Try it

Use the hosted app:

```text
https://simiono.com/ductus/
```

Mirror:

```text
https://utrost.github.io/ductus/
```

Or run it locally:

```sh
npm test
npm run serve
```

Then open:

```text
http://localhost:8000/
```

Opening `index.html` directly from disk works for quick experiments, but service worker and install behavior depend on the browser's `file://` rules.

## Basic use

1. Open Ductus.
2. Pick a hand, group, and glyph. The starter path is `Kurrent Basic → Warm-ups → Hairline`.
3. Read the `What to practice` panel for the selected glyph.
4. Optionally enable `Show pressure` to draw reference and attempt strokes with pressure-based thickness.
5. Draw the sample with a stylus or mouse.
6. Click `Score`.
7. Read the five bars separately.
8. Use `Save attempt` to export a `.txt` file when sharing device-test data.
9. Use `Clear` or `Undo` and try again.
10. Switch to `Author` mode to draw a new reference.
11. Click `Adopt attempt as reference`.
12. Save the reference JSON if you want to keep it.

The bars are deliberately separate. A stroke can have the right shape but the wrong direction. It can be in the right place but written in the wrong order. One total score would hide that.

## Scoring model

Ductus scores five things:

- `Form:` path placement, using DTW over arc-length-resampled points
- `Order:` whether strokes appear in the same order as the reference
- `Direction:` whether each stroke travels the same way
- `Pressure:` pressure-shape comparison with noisy contact/lift samples trimmed and per-attempt normalization so compressed device ranges can still match the intended curve
- `Rhythm:` a rough velocity-variance heuristic; diagnostics report in-stroke sampling gaps separately from pauses between strokes

The app also reports data-quality labels where the data is known to be partial: missing/flat/real pressure, sparse/noisy/usable timing data, and stroke-count mismatches that make direction or pressure comparisons only partial. Attempt exports include a pressure profile summary with raw range, trimmed range, median, p90, p95, and range label.

The scoring is intentionally transparent. The prototype should help find useful feedback, not pretend to be an authority.

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

Coordinates are normalized to the reference canvas. The scorer resamples paths by arc length, not by raw event timing, so shape and pressure can be compared without making drawing speed the only signal.

## Repository layout

```text
.
├── index.html                 # App shell, UI, drawing, scorer
├── manifest.webmanifest       # PWA metadata
├── sw.js                      # Offline app-shell cache
├── icons/                     # SVG and PNG install icons
├── tests/ductus-core.test.cjs # Headless regression tests
├── docs/roadmap.md            # Roadmap and open questions
├── docs/device-testing-findings.md # Current real-device findings and calibration notes
├── docs/manual-device-test-checklist.md # Manual stylus test script
└── .github/workflows/         # CI, AI-prune, GitHub Pages deploy
```

## Development

Run tests:

```sh
npm test
```

Serve locally:

```sh
npm run serve
```

The tests intentionally avoid external dependencies. They load the inline app script in a Node VM with a mocked DOM/canvas and check the PWA wiring plus scoring behavior.

## Deployment

The app uses relative paths, so the same static files can run under `/ductus/` on simiono.com and GitHub Pages.

Deployable files:

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `icons/`
- `docs/`

GitHub Pages is served by `.github/workflows/deploy-pages.yml`. simiono.com is a separate FTPS deploy of the same static app shell to `/ductus/`.

## Non-goals for now

- Accounts
- Cloud sync
- Analytics
- A global leaderboard
- Automatic judgement of artistic quality
- A large framework stack

First the movement model has to be useful.
