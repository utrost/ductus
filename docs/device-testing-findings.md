# Device testing findings

Current working notes from the first Android Chrome + stylus testing pass. These are calibration notes, not final product claims.

## Current tested setup

Observed from manual screenshots and exported attempt `.txt` files:

- Platform: Android Chrome, mobile viewport, stylus input
- App URL: GitHub Pages build of Ductus
- Pressure data: real pressure values are reported, not a flat mouse-style `0.5`
- Useful test artifact: exported attempt `.txt`; screenshot is secondary and mainly confirms UI/scoring visibility

## What the data shows

### Pressure data is real and useful

The Android/stylus attempts produced broad pressure ranges, including values near zero and near one. That is enough for pressure visualization and pressure scoring experiments.

Examples seen in exported attempts:

- Kurrent `n`: pressure values ranged from about `0.006` to `1.000`
- Warm-up downstrokes on the same Android Chrome stylus setup varied from about `0.25–0.46` median/peak-ish controlled pressure to much higher force in other attempts
- Warm-up hairline: pressure was often medium rather than truly light
- Compound curve attempts showed when a stroke stayed heavy throughout instead of reading thin → thick → thin

The `Show pressure` toggle is therefore useful: it makes score surprises visible instead of hiding them behind a number.

### Pressure should be profiled, not treated as one universal absolute scale

The Android Chrome batch shows useful stylus pressure, but ordinary controlled strokes do not always use the full `0–1` range. The scorer now keeps raw pressure, trims contact/lift samples for comparison, and exports a pressure profile summary:

- raw min/max
- trimmed min/max
- median
- p90 and p95
- range label: `flat`, `narrow`, `useful`, or `broad`

Pressure comparison now favors curve shape after per-attempt normalization, so a compressed-but-correct device range can still match a reference. Raw values remain in the export for later calibration.

### Hairline reference needs calibration samples

A hairline attempt with median pressure around `0.48` still scored moderately. For a reference named “hairline”, that may be too generous. Do not retune from a single attempt; collect paired samples first:

- one deliberately light hairline
- one deliberately heavy hairline

Then adjust pressure thresholds.

### Compound curve failures are visible now

Several compound attempts were angular or heavy throughout. The pressure view made this clear. The current feedback hint should guide toward:

- light entry
- heavier middle
- lighter exit

Next improvement should be visual per-stroke or per-segment mismatch markers, not just text.

### Stroke-count mismatch was confusing and is now labeled partial

Edge cases exposed a confusing score combination:

- Order: `0` due to stroke-count mismatch
- Direction: `100` because the available stroke moved in the expected direction

The app now labels direction as `partial: stroke count mismatch` and pressure as `real · partial` when reference and attempt stroke counts differ.

### Rhythm diagnostics needed separation of gap types

Early diagnostics counted pauses between strokes as sampling gaps. That over-reported rhythm noise for multi-stroke glyphs.

Diagnostics now separate:

- in-stroke sampling gaps
- pause between strokes

Only in-stroke gaps should make rhythm confidence noisy.

### Mobile score visibility is a real UX issue

Repeated screenshots showed Android Chrome browser chrome covering the lower score/feedback area. The app now adds mobile bottom padding and scrolls the metrics block into view after scoring.

### High pressure score can still need form context

Real attempts showed a case where the pressure curve looked plausible while the downstroke path wandered far from the reference. The app now adds plain feedback for that combination instead of letting a high pressure score look like a general pass:

- “Pressure looks plausible, but the stroke path is off…”

This keeps pressure as one signal among several, not a hidden total judgement.

This still needs real-device confirmation after the service worker refreshes.

## Calibration batch received: 2026-08-05 Android Firefox

The first paired calibration batch is now preserved under:

```text
data/calibration/2026-08-05-firefox-android/
```

Detailed notes:

```text
docs/calibration-2026-08-05-firefox-android.md
```

The batch covers:

1. Hairline: light attempt
2. Hairline: heavy attempt
3. Downstroke: heavy attempt
4. Downstroke: light attempt
5. Compound curve: more plausible thin → thick → thin attempt
6. Compound curve: heavy-throughout attempt
7. Kurrent `n`: normal two-stroke attempt
8. Kurrent `n`: wrong-count/wrong-order attempt

Most important finding: pressure signal is real, but the current `flat` label is overloaded. It describes low variation, not pressure level. A flat light hairline, flat heavy hairline, flat heavy downstroke, and flat light downstroke need different feedback.

## Next implementation target

Add pressure diagnostics and feedback that separate:

- pressure level: low / medium / high
- pressure variation: flat / narrow / useful / broad

Then add reference-specific expectations:

- hairline: low level, low/even variation
- downstroke: high level, steady profile
- compound curve: lighter entry/exit, heavier middle
- Kurrent `n`: first stroke lighter, second stroke heavier then tapering

## Do not conclude yet

The batch is enough to improve pressure diagnostics and reference-specific pressure feedback. It is not enough to finalize rhythm scoring: all Firefox exports still report noisy timing, with large in-stroke gaps.
