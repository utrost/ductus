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
2. Draw the built-in Kurrent `n` with the stylus.
3. Click **Score**.
4. Confirm the five bars update.
5. Click **Save attempt**.
6. Reload the page.
7. Confirm the app still opens while online.
8. If installed as a PWA, turn network off and open it again.

Expected result:

- Drawing works with pen or mouse.
- Finger input is ignored.
- Scoring does not crash.
- Attempt JSON downloads.
- Installed/offline app shell opens after one online load.

## Pointer behavior

While drawing, note:

- Does the browser report the input as pen, mouse, or touch?
- Does the canvas scroll, zoom, or select text by accident?
- Is palm/finger contact ignored well enough?
- Are strokes visibly delayed?
- Are fast curves smooth or broken into straight segments?

## Pressure range

Draw four test strokes:

1. Very light stroke.
2. Medium stroke.
3. Heavy stroke.
4. One stroke that fades from light to heavy and back.

Then export the attempt JSON and inspect point pressure values.

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

- Backwards stroke should reduce **Direction** more than **Form**.
- Swapped strokes should reduce **Order** more than **Form**.
- Uneven stop-start drawing should reduce **Rhythm**.
- If pressure is missing or constant, **Pressure** should not be trusted yet.

## Notes to bring back

For each device, write the useful failures plainly:

- What worked:
- What broke:
- What felt awkward:
- What should Ductus warn about automatically:
- Should pressure scoring be enabled, optional, or disabled on this device:
