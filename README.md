# Ductus

Ductus is an offline calligraphy trainer for practicing ductus: the movement behind a written form.

It does not try to decide whether the final drawing looks nice. It compares how a glyph was written: stroke order, stroke direction, path form, pressure change, and rhythm. That is the useful part if the goal is practice rather than image matching.

The current version is a static web app and PWA. No backend. No account. No analytics. It can run from a local file for quick tests, or from GitHub Pages when installed as an app.

- App: <https://utrost.github.io/ductus/>
- Source: <https://github.com/utrost/ductus>
- Roadmap: [docs/roadmap.md](docs/roadmap.md)
- License: MIT

## Current status

Ductus is a prototype. It is usable enough to test the idea, not finished enough to be trusted as a teacher.

Implemented now:

- Single-page app in `index.html`
- PWA manifest, service worker, and install icons
- Mobile-responsive layout
- Built-in Kurrent `n` reference
- Stylus and mouse stroke capture
- Pressure capture where the browser/device exposes it
- Practice mode with scoring
- Author mode for turning an attempt into a reference
- Reference JSON load/save
- Attempt JSON export
- Five scoring dimensions: form, order, direction, pressure, rhythm
- Dependency-free Node regression tests
- GitHub Actions CI
- GitHub Pages deployment

Known limits:

- Only one built-in reference glyph exists.
- Pressure behavior depends on browser and hardware.
- Authoring a good reference still needs judgement.
- There is no local progress history yet.
- Accessibility around the drawing surface needs work.

## Try it

Use the hosted app:

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
2. Draw the sample glyph with a stylus or mouse.
3. Click **Score**.
4. Read the five bars separately.
5. Use **Clear** or **Undo** and try again.
6. Switch to **Author** mode to draw a new reference.
7. Click **Adopt attempt as reference**.
8. Save the reference JSON if you want to keep it.

The bars are deliberately separate. A stroke can have the right shape but the wrong direction. It can be in the right place but written in the wrong order. One total score would hide that.

## Scoring model

Ductus scores five things:

- **Form:** path placement, using DTW over arc-length-resampled points
- **Order:** whether strokes appear in the same order as the reference
- **Direction:** whether each stroke travels the same way
- **Pressure:** correlation between reference pressure and attempt pressure
- **Rhythm:** a rough velocity-variance heuristic

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

GitHub Pages is served from the static app shell. The deployment workflow copies these files into the Pages artifact:

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `icons/`

The app uses relative paths so it can run under `/ductus/` on GitHub Pages.

## Non-goals for now

- Accounts
- Cloud sync
- Analytics
- A global leaderboard
- Automatic judgement of artistic quality
- A large framework stack

First the movement model has to be useful.
