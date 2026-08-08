# Manual device test checklist

Use this when testing Ductus on real stylus hardware. The goal is not to judge handwriting quality. The goal is to find out what pointer data the browser actually gives us.

## Setup

Record this before drawing:

- Device:
- OS/version:
- Browser/version:
- Stylus model:
- Screen refresh rate, if known:
- Ductus URL or commit:
- Date:

The exported attempt `.txt` now records browser/device context automatically: user agent, platform, touch-point count, DPR, viewport size, PointerEvent support, and coalesced-event support. It also embeds the active app settings, including selected reference, mode, and whether `Show pressure` was enabled; the full score object; diagnostics; and raw strokes. Still write the plain device/browser names above because user-agent strings are not always readable.

## Browser matrix for this pass

This comparison makes sense. Use the same attempts on each browser so the data can be compared:

- Windows Chrome
- Windows Firefox
- Android Chrome
- Android Firefox

For each browser, do one hard refresh before testing. On Android/Chrome, if the installed PWA or browser still behaves strangely, clear site data for GitHub Pages or append a harmless query string such as `?test=2026-07-31`.

## Devices to cover

Minimum useful set:

- Android tablet + stylus
- iPad/Safari
- Desktop drawing tablet

Nice to have later:

- Android phone with passive touch only
- Desktop browser with mouse only
- Firefox/Chrome/Safari comparison where available

## Smoke test

1. Open Ductus.
2. Confirm the hand/group/glyph chooser opens at `Kurrent Basic → Warm-ups → Hairline`.
3. Confirm `Show pressure` is visible and the `What to practice` panel describes a light, even upstroke.
4. Switch to `Warm-ups → Downstroke` and confirm the guidance changes to firm pressure / release near the baseline.
5. Switch to `Lowercase stems → Kurrent n · sample`, draw it with the stylus.
6. Enable `Show pressure` and confirm the visible stroke thickness changes with pressure.
7. Click `Score`.
8. Confirm the five bars update and the score block is scrolled into view on mobile.
9. Click `Save attempt`.
10. Reload the page.
11. Confirm the app still opens while online.
12. If installed as a PWA, turn network off and open it again.

Expected result:

- Drawing works with pen or mouse.
- The chooser exposes one hand (`Kurrent Basic`), two groups (`Warm-ups`, `Lowercase stems`), and keeps all existing built-in reference IDs available.
- The `What to practice` guidance changes with the selected glyph and gives concrete pressure/order cues.
- Finger input is ignored.
- Scoring does not crash.
- Attempt `.txt` downloads.
- `Show pressure` makes heavy strokes visibly thicker than light strokes.
- Mobile score metrics remain reachable above browser chrome after pressing `Score`.
- Installed/offline app shell opens after one online load.

## Pointer behavior

While drawing, note:

- Does the browser report the input as pen, mouse, or touch?
- Does the canvas scroll, zoom, or select text by accident?
- Is palm/finger contact ignored well enough?
- Are strokes visibly delayed?
- Are fast curves smooth or broken into straight segments?

## Pressure range

Draw these attempts with `Show pressure` enabled, press `Score`, then save the attempt `.txt` and take a screenshot when the visible score looks surprising:

1. Warm-up hairline, as light as possible.
2. Warm-up hairline, deliberately too heavy.
3. Warm-up downstroke, firm/heavy and steady.
4. Warm-up downstroke, deliberately too light.
5. Warm-up compound curve, deliberate thin → thick → thin.
6. Warm-up compound curve, deliberately heavy throughout.
7. Kurrent `n`, normal two-stroke attempt.
8. Kurrent `n`, deliberately wrong stroke count or wrong direction.

Then inspect point pressure values from the exported `.txt` files.

Record:

- Minimum pressure seen:
- Maximum pressure seen:
- Typical light pressure:
- Typical heavy pressure:
- Does pressure stay stuck at `0.5`?
- Does pressure jump instead of changing smoothly?

Expected result:

- A pressure-capable stylus should produce values below and above `0.5`.
- A mouse-only setup will usually stay at `0.5`; that is fine, but Ductus should eventually say so.

## Event sampling

Draw these strokes and export attempt JSON:

1. Slow straight line.
2. Fast straight line.
3. Slow curve.
4. Fast curve.

Record:

- Approximate points per slow stroke:
- Approximate points per fast stroke:
- Any obvious gaps:
- Any timestamp jumps:
- Does event sampling change between browser and PWA install mode?

Expected result:

- Fast strokes should still contain enough points to show the path.
- If sampling is sparse, rhythm scoring may be unreliable on that device.

## Scoring sanity checks

Use the built-in glyph.

1. Draw in roughly the right shape and order.
2. Draw the first stroke backwards.
3. Draw the two strokes in swapped order.
4. Draw in the right place but with deliberately uneven stops.

Expected result:

- Backwards stroke should reduce `Direction` more than `Form`.
- Swapped strokes should reduce `Order` more than `Form`.
- Uneven stop-start drawing should reduce `Rhythm`.
- If pressure is missing or constant, `Pressure` should not be trusted yet.

## Notes to bring back

For each device, write the useful failures plainly:

- What worked:
- What broke:
- What felt awkward:
- What should Ductus warn about automatically:
- Should pressure scoring be enabled, optional, or disabled on this device:
