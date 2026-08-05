# Calibration batch: Android Firefox stylus, 2026-08-05

This preserves and summarizes the first paired Ductus calibration exports Uwe sent from `https://simiono.com/ductus/`.

## Source

Raw exports are preserved under:

```text
data/calibration/2026-08-05-firefox-android/
```

Summary artifact:

```text
data/calibration/2026-08-05-firefox-android/summary.json
```

Environment common to the exports:

```text
Android 16 / Firefox 153
platform: Linux armv81
viewport: 746 x 600
devicePixelRatio: 3
pointerEvent: true
coalescedEvents: true
showPressure: true
```

Captured range:

```text
2026-08-05T13:42:12.879Z – 2026-08-05T13:44:34.114Z
```

## Attempts

- `warmup-hairline-attempt-2.json`
  - reference: `warmup-hairline`
  - score: form 98, order 100, direction 100, pressure 67, rhythm 35
  - pressure: confidence `flat`, median `0.006`, trimmed range `0.000`, label `flat`
  - reading: successful light hairline sample; after contact/lift trimming it is essentially at the hardware floor

- `warmup-hairline-attempt-3.json`
  - reference: `warmup-hairline`
  - score: form 97, order 100, direction 100, pressure 50, rhythm 29
  - pressure: confidence `flat`, median `0.851`, trimmed range `0.016`, label `flat`
  - reading: intentionally heavy hairline; shape is good, pressure is wrong

- `warmup-downstroke-attempt-1.json`
  - reference: `warmup-downstroke`
  - score: form 96, order 100, direction 100, pressure 50, rhythm 26
  - pressure: confidence `flat`, median `0.850`, trimmed range `0.013`, label `flat`
  - reading: heavy downstroke, matches the intended force level but app currently labels it flat and gives the same pressure score as the light version

- `warmup-downstroke-attempt-2.json`
  - reference: `warmup-downstroke`
  - score: form 98, order 100, direction 100, pressure 50, rhythm 49
  - pressure: confidence `flat`, median `0.098`, trimmed range `0.022`, label `flat`
  - reading: deliberately light downstroke; should be clearly worse than the heavy downstroke for this reference

- `warmup-compound-curve-attempt-3.json`
  - reference: `warmup-compound`
  - score: form 95, order 100, direction 100, pressure 81, rhythm 22
  - pressure: confidence `real`, median `0.753`, trimmed range `0.075`, label `narrow`
  - reading: usable compound sample with some thin→thick→thin shape but long duration and noisy timing

- `warmup-compound-curve-attempt-4.json`
  - reference: `warmup-compound`
  - score: form 86, order 100, direction 100, pressure 97, rhythm 30
  - pressure: confidence `real`, median `0.944`, trimmed range `0.050`, label `narrow`
  - reading: likely too heavy overall; the current pressure score is too generous because normalized curve shape hides absolute pressure level

- `kurrent-n-attempt-4.json`
  - reference: `sample-n`
  - score: form 95, order 100, direction 100, pressure 45, rhythm 36
  - pressure: confidence `real`, median `0.500`, trimmed range `0.374`, label `useful`
  - reading: normal two-stroke Kurrent `n` with useful pressure range; good positive fixture

- `kurrent-n-attempt-5.json`
  - reference: `sample-n`
  - score: form 16, order 0, direction 47, pressure 75, rhythm 47
  - pressure: confidence `real · partial`, median `0.651`, trimmed range `0.284`, label `useful`
  - reading: wrong-count/wrong-order edge case; current partial labels and explanation are doing useful work

## Findings

### 1. Android Firefox stylus pressure is real

The batch has raw pressure ranges from near floor values around `0.006–0.010` up to `0.97`. This is enough signal for pressure practice and feedback.

### 2. The `flat` label currently mixes two different meanings

The current pressure profile labels these as `flat`:

- very light/even hairline: median `0.006`, range `0.000`
- heavy/even hairline: median `0.851`, range `0.016`
- heavy/even downstroke: median `0.850`, range `0.013`
- light/even downstroke: median `0.098`, range `0.022`

That is technically true for curve range, but not sufficient as user feedback. We need separate labels for:

- pressure level: low / medium / high
- pressure variation: flat / narrow / useful / broad

### 3. Pressure scoring needs reference-specific absolute-level checks

Per-attempt normalization is useful for comparing curve shape, but it hides absolute pressure mistakes.

Concrete examples:

- heavy hairline is shaped well but should be scored as too heavy
- light downstroke is shaped well but should be scored as too light
- compound attempt 4 scores pressure 97 even though the whole stroke is high-pressure and should probably be penalized for failing thin→thick→thin

### 4. Kurrent wrong-count feedback is useful

`kurrent-n-attempt-5` correctly surfaces:

```text
Reference expects 2 strokes; attempt has 4.
Stroke order differs from the reference.
The matched shape can still look right while the ductus is wrong.
```

That is exactly the kind of ductus-specific feedback the app should keep.

### 5. Rhythm is still unreliable in Firefox exports

All attempts report `timing data: noisy`, with max in-stroke gaps from `163 ms` to `379 ms`, and Kurrent wrong-count showing an inter-stroke pause of `809 ms`.

Do not tune rhythm strictness from this batch yet. Use it for confidence/warning behavior, not final rhythm scoring.

## Next implementation slice

1. Split pressure diagnostics into two dimensions:
   - pressure level: `low`, `medium`, `high`
   - pressure variation: `flat`, `narrow`, `useful`, `broad`
2. Add reference-specific pressure expectations:
   - hairline expects low level and low variation
   - downstroke expects high level and steady/heavy profile
   - compound expects low entry/exit and higher middle
   - Kurrent `n` expects first stroke lighter, second stroke heavier then tapering
3. Add regression fixtures from this batch.
4. Update pressure feedback so the examples say the obvious thing:
   - heavy hairline: too heavy
   - light downstroke: too light
   - heavy-throughout compound: entry/exit too heavy
5. Keep rhythm confidence warnings, but do not retune rhythm thresholds from this batch alone.

## Current status

This is a useful first calibration batch. It is enough to improve pressure diagnostics and reference-specific pressure feedback. It is not enough to finalize rhythm scoring.

## Implemented calibration response

The app now distinguishes pressure level from pressure variation in diagnostics:

- level: `low`, `medium`, `high`
- variation: `flat`, `narrow`, `useful`, `broad`

Scoring also applies reference-specific pressure expectations for the warm-up references:

- hairline: low pressure is rewarded; high pressure is flagged as too heavy
- downstroke: high pressure is rewarded; low pressure is flagged as too light
- compound curve: heavy entry/exit is penalized and explained

The calibration fixture assertions live in `tests/ductus-core.test.cjs` and read this batch directly.

Rhythm remains unchanged because the Android Firefox timing data in this batch is still noisy.
