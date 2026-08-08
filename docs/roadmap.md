# Roadmap

Ductus should become a small teacher for *how a hand is written*, not a generic drawing judge. The movement scorer is now useful enough to support the next layer: hands, glyph groups, and practice sequences.

Internal vocabulary:

- **Hand**: a learnable writing style, for example Kurrent Basic.
- **Glyph**: one practiced form inside a hand, for example `n` or a warm-up stroke.
- **Stroke recipe**: the ordered movement, pressure, direction, and hint data for a glyph.
- **Lesson/group**: a small practice set, for example warm-ups or lowercase stem letters.

User-facing copy can still say “font” where that helps, but the app should model movement as **hands**, not as rendered font outlines.

## Phase 0: public prototype

Status: done enough for its purpose.

Goal: make the current web prototype easy to try and easy to inspect.

Done:

- Static app shell
- Offline-capable PWA wiring
- Four built-in references: Kurrent `n`, hairline, downstroke, compound curve
- Stylus/mouse stroke capture
- Reference JSON load/save
- Attempt export as `.txt` for mobile sharing
- Author metadata: hand, tool, notes
- Stroke numbering and direction markers on the reference ghost
- Accidental tiny-stroke filtering
- Pointer diagnostics with pressure/sampling/stroke-count warnings
- Attempt export
- Five-part scoring: form, order, direction, pressure, rhythm
- Pressure trimming for noisy contact/lift samples
- Per-attempt pressure profile diagnostics in exports and the diagnostics panel
- Pressure-shape normalization for compressed device ranges
- Pressure diagnostics split level from variation:
  - level: `low`, `medium`, `high`
  - variation: `flat`, `narrow`, `useful`, `broad`
- Reference-specific pressure expectations for warm-up references:
  - hairline rewards low/even pressure and flags heavy pressure
  - downstroke rewards firm pressure and flags light pressure
  - compound curve penalizes heavy entry/exit
- Confidence/data-quality labels for pressure/rhythm/order signals
- Pressure visualization toggle with pressure-based stroke thickness
- Mobile score auto-scroll and bottom padding for Android/Chrome browser UI
- Rhythm diagnostics split in-stroke sampling gaps from inter-stroke pauses
- Partial confidence labels for stroke-count mismatch cases
- Plain-language pressure/count-mismatch feedback from real calibration attempts
- First Android Firefox calibration batch preserved under `data/calibration/2026-08-05-firefox-android/`
- Current device-testing findings documented
- Dependency-free regression tests
- GitHub Actions CI
- GitHub Pages deployment
- simiono.com `/ductus/` deployment
- README and public project note

Remaining:

- Add a review view before adopting an attempt as reference
- Add per-stroke visual mismatch markers for form/pressure/rhythm
- Keep collecting real-device attempts when a scoring change needs evidence

Exit criterion:

- A new visitor can open the app, draw the built-in glyph, understand the score bars, and export an attempt/reference without reading the source.

## Phase 1: Hand Library v1

Status: implemented as a first thin slice; needs content expansion before it becomes a real curriculum.

Goal: stop treating Ductus as a flat pile of sample references. Give the app a small hand/glyph structure so it can teach a writing style in sequence.

Architecture:

- Keep the app static and dependency-free.
- Add a plain JS data model for hands, groups, and glyph references.
- Reuse the current reference objects. Do not introduce font files, SVG font import, or a large content pipeline yet.

Done in first thin slice:

- Built-in `hands` registry with `kurrent-basic`.
- First groups:
  - `warmups`: hairline, downstroke, compound curve
  - `lowercase-stems`: Kurrent `n`
- Three-level practice chooser:
  - Hand
  - Group
  - Glyph
- Old reference IDs and `referenceById(...)` compatibility preserved.
- Attempt exports include:
  - `selectedHandId`
  - `selectedGroupId`
  - `selectedReferenceId`
- Regression coverage for hands, groups, default selection, grouped references, export settings, and old flat reference compatibility.

Still planned for this phase:

1. Add a small amount of real Kurrent Basic content beyond sample `n`.
2. Add user-facing group notes / practice sequence hints.
3. Update the authoring path so a reviewed custom reference can be assigned into a hand/group.

Original planned work:

1. Add a built-in `hands` registry.
   - First hand: `kurrent-basic`.
   - First groups:
     - `warmups`: hairline, downstroke, compound curve
     - `lowercase-stems`: Kurrent `n` plus the first related glyphs as they are authored
2. Replace the flat glyph selector with a three-level practice chooser:
   - Hand
   - Group
   - Glyph
3. Keep old reference IDs stable.
   - Existing exports with `selectedReferenceId` must still be meaningful.
   - `referenceById('warmup-hairline')` and existing tests must continue to work.
4. Add test coverage for:
   - available hands
   - default hand/group/glyph selection
   - all glyph IDs resolving to references
   - old flat reference API compatibility
5. Update exports so settings include:
   - `selectedHandId`
   - `selectedGroupId`
   - `selectedReferenceId`
6. Update README and manual checklist to explain practicing a hand rather than only scoring a glyph.

Exit criterion:

- The app opens into `Kurrent basic → Warm-ups → Hairline` or another deliberate starter point, and the user can move through a hand/group/glyph structure without losing the existing scoring/export behavior.

## Phase 2: Kurrent starter hand

Goal: create enough reference content that Ductus can support a short real practice session.

Planned glyph path:

1. Warm-ups:
   - hairline
   - downstroke
   - compound curve
2. Lowercase stem family:
   - `i`
   - `u`
   - `n`
   - `m`
3. First connectors / simple letters:
   - `e`
   - `r`
   - optionally `a` if the authoring quality is good enough
4. Short practice fragments:
   - two-letter joins
   - three-letter fragments
   - tiny words made only from known glyphs

Rules for this phase:

- Prefer a few good references over a full alphabet.
- Every glyph needs stroke hints, expected pressure behavior, and notes on common mistakes.
- Do not invent authority. Label the first hand as a starter/practice hand, not “authentic definitive Kurrent.”
- Add each new glyph with a calibration fixture or a manually reviewed reference export.

Exit criterion:

- Ductus can guide a 5–10 minute Kurrent stem practice session without requiring the user to author references first.

## Phase 3: reference authoring

Goal: make it easier to create reference glyphs that are actually useful.

Planned work:

- Add a reference metadata panel: script, glyph, hand, nib/pen, notes ✓ initial hand/tool/notes fields exist
- Make baseline and x-height editable in author mode
- Show per-stroke hints while practicing
- Add stroke numbering and direction arrows to the reference ghost ✓ initial markers exist
- Add a review view before adopting an attempt as reference
- Add import/export examples under `examples/`
- Let a reviewed authored reference be assigned to a hand/group

Exit criterion:

- A small reference set can be authored, reviewed, saved, grouped into a hand, and loaded again without editing JSON by hand.

## Phase 4: device and pressure testing

Goal: keep scoring honest across real hardware.

Done:

- Android stylus pressure capture confirmed on Firefox/Android
- First paired calibration batch preserved and documented
- Pressure level/variation split implemented
- Reference-specific pressure scoring implemented for warm-up references

Planned work:

- Test iPad/Safari behavior
- Test desktop drawing tablet behavior
- Record pressure ranges and event sampling rates for new devices
- Add an in-app pressure calibration strip if device variance makes it necessary
- Decide whether pressure scoring should be optional per hand/glyph

Exit criterion:

- The app can tell the user when pressure data is missing, flat, device-floor, or unreliable, instead of quietly scoring nonsense.

## Phase 5: feedback quality

Goal: turn numbers into practice feedback.

Planned work:

- Add per-stroke mismatch markers
- Highlight reversed strokes
- Show the closest reference stroke for each attempt stroke
- Split pressure feedback from form feedback visually
- Add short plain-language feedback for common failure cases ✓ first pressure/count-mismatch hints exist
- Save attempt history locally, probably in IndexedDB
- Eventually show “practice this previous weak glyph again” inside the current hand

Exit criterion:

- A bad attempt points to the part that needs practice, not just to a low score.

## Phase 6: more hands / font-adjacent work

Goal: decide how far Ductus should go toward “fonts” while keeping movement as the authority.

Possible hands:

- Kurrent Basic expansion
- Foundational hand
- Italic hand
- Copperplate-ish pressure exercises
- Personal/custom hand authored from Uwe’s own references

Possible font-adjacent tools:

- Rendered exemplar overlays from SVG paths
- Import of outline fonts only as visual guides
- Conversion of an outline glyph into a draft movement reference, always requiring human review

Non-rule:

- Do not let font outlines become the teacher. A pretty outline with wrong ductus is not the thing Ductus is meant to teach.

Exit criterion:

- Ductus has a clear boundary between visual exemplars and movement references.

## Phase 7: native app decision

Goal: decide whether the original Android/Kotlin direction is still needed.

Questions:

- Does browser pressure data work well enough?
- Is stylus latency acceptable?
- Does PWA install behavior feel good enough for practice?
- Would native Android give meaningfully better MotionEvent access?
- Is the hand/glyph teaching model worth carrying into a native app?

Exit criterion:

- Either keep Ductus as a web/PWA project, or start a native build with specific reasons instead of vague platform anxiety.

## Non-goals

- Cloud accounts
- Shared reference marketplace
- Social scoring
- AI handwriting judgement
- Perfect OCR-style glyph recognition
- Treating font outlines as authoritative ductus
- A framework rewrite for its own sake
