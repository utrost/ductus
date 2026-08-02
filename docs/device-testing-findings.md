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

## Current data request

Most useful next data set:

1. Hairline: light attempt
2. Hairline: heavy attempt
3. Downstroke: heavy attempt
4. Downstroke: light attempt
5. Compound curve: good thin → thick → thin attempt
6. Compound curve: heavy-throughout attempt
7. Kurrent `n`: normal two-stroke attempt
8. Kurrent `n`: wrong-count or wrong-direction attempt

For each attempt:

- send the exported `.txt`
- send a screenshot after scoring with `Show pressure` enabled if the visible result is surprising or if mobile layout still hides scores

## Do not conclude yet

Not enough data yet to finalize numeric thresholds for pressure or rhythm. Enough data exists to improve diagnostics, visibility, confidence labels, and first feedback hints.
