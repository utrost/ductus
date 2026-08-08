const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(new URL('../index.html', `file://${__filename}`), 'utf8');
assert.match(html, /<title>Ductus<\/title>/);
assert.match(html, /<link\s+rel="manifest"\s+href="\.\/manifest\.webmanifest"/);
assert.match(html, /navigator\.serviceWorker\.register\('\.\/sw\.js'\)/);
assert.match(html, /@media\s*\(max-width:\s*720px\)/);
assert.match(html, /id="scoreHelp"/);
assert.match(html, /<details[^>]+id="scoreHelp"/);
assert.match(html, /<summary>What the scores mean<\/summary>/);
assert.match(html, /Form<\/b> checks path placement/);
assert.match(html, /Order<\/b> checks whether strokes were made in the reference sequence/);
assert.match(html, /docs\/manual-device-test-checklist\.md/);
assert.match(html, /<details[^>]+id="referencePanel"/);
assert.match(html, /<summary>Reference JSON<\/summary>/);
assert.match(html, /@media\s*\(max-width:\s*720px\)[\s\S]*#referencePanel\s+textarea\s*\{\s*min-height:\s*72px/);
assert.match(html, /id="diagnostics"/);
assert.match(html, /Pointer data/);
assert.match(html, /attempt\.txt/);
assert.match(html, /text\/plain/);
assert.match(html, /id="metaHand"/);
assert.match(html, /id="metaTool"/);
assert.match(html, /id="metaNotes"/);
assert.match(html, /value="warmup-hairline"/);
assert.match(html, /value="warmup-downstroke"/);
assert.match(html, /id="handSelect"/);
assert.match(html, /id="groupSelect"/);
assert.match(html, /value="kurrent-basic"/);
assert.match(html, /value="warmups"/);
assert.match(html, /value="lowercase-stems"/);
assert.match(html, /value="warmup-compound"/);
assert.match(html, /drawReferenceMarkers/);
assert.match(html, /Pressure confidence/);
assert.match(html, /id="pressureView"/);
assert.match(html, /Show pressure/);
assert.match(html, /Pressure view draws reference and attempt thickness from pressure data/);
assert.match(html, /scrollMarginBlockStart/);
assert.match(html, /scoreIntoView/);
assert.match(html, /padding-bottom:calc\(12px \+ env\(safe-area-inset-bottom\) \+ 76px\)/);

const checklist = fs.readFileSync(new URL('../docs/manual-device-test-checklist.md', `file://${__filename}`), 'utf8');
assert.match(checklist, /# Manual device test checklist/);
assert.match(checklist, /Android tablet \+ stylus/);
assert.match(checklist, /iPad\/Safari/);
assert.match(checklist, /Desktop drawing tablet/);
assert.match(checklist, /pressure range/i);
assert.match(checklist, /event sampling/i);
assert.match(checklist, /Windows Chrome/);
assert.match(checklist, /Android Firefox/);
assert.match(html, /environmentSnapshot/);
assert.match(html, /maxTouchPoints/);

const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.webmanifest', `file://${__filename}`), 'utf8'));
assert.equal(manifest.name, 'Ductus');
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.icons.some(icon => icon.src === './icons/icon-192.png'));
assert.ok(manifest.icons.some(icon => icon.src === './icons/icon-512.png'));

const sw = fs.readFileSync(new URL('../sw.js', `file://${__filename}`), 'utf8');
assert.match(sw, /PRECACHE_URLS/);
assert.match(sw, /'\.\/index\.html'/);
assert.match(sw, /'\.\/docs\/manual-device-test-checklist\.md'/);

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 1);
const noop = () => {};
class MockElement {
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.style = {}; this.children = []; this.listeners = {}; this.value = ''; this.checked = false; this.textContent = ''; this.className = ''; this.classList = { add: noop, remove: noop, toggle: noop }; }
  addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener); }
  removeEventListener() {}
  setAttribute(name, value) { this[name] = String(value); }
  append(...items) { this.children.push(...items); }
  appendChild(item) { this.children.push(item); return item; }
  getContext() { return { setTransform: noop, scale: noop, clearRect: noop, fillRect: noop, beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop, fillText: noop, arc: noop, closePath: noop, fill: noop, save: noop, restore: noop, drawImage: noop }; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 1000, height: 1000 }; }
  setPointerCapture() {}
  click() {}
  set innerHTML(v) { this.children = []; }
  get innerHTML() { return ''; }
}
const elements = new Map();
function element(id) { if (!elements.has(id)) elements.set(id, new MockElement(id === 'board' ? 'canvas' : 'div')); return elements.get(id); }
const document = { getElementById: element, createElement: tag => new MockElement(tag), addEventListener: noop, removeEventListener: noop };
const window = { devicePixelRatio: 2, addEventListener: noop, removeEventListener: noop, matchMedia: () => ({ matches: false }) };
window.window = window; window.document = document;
const navigator = {
  userAgent: 'TestBrowser/1.0 Firefox/140.0',
  platform: 'TestOS',
  maxTouchPoints: 5,
  serviceWorker: { register: noop }
};
const sandbox = { window, document, navigator, console, Date, Math, Number, String, Array, JSON, Blob: class Blob {}, URL: { createObjectURL: () => 'blob:test', revokeObjectURL: noop }, setTimeout, clearTimeout, innerWidth: 1000, innerHeight: 1000, alert: noop, PointerEvent: function PointerEvent() {} };
vm.createContext(sandbox);
vm.runInContext(scripts[0][1], sandbox, { filename: 'index.html' });
const core = window.__ductus;
assert.ok(core, 'Ductus should expose a headless test API');
const hands = core.availableHands();
assert.equal(JSON.stringify(hands.map(hand => hand.id)), JSON.stringify(['kurrent-basic']));
assert.equal(hands[0].label, 'Kurrent Basic');
assert.equal(JSON.stringify(hands[0].groups.map(group => group.id)), JSON.stringify(['warmups', 'lowercase-stems']));
assert.equal(JSON.stringify(hands[0].groups[0].referenceIds), JSON.stringify(['warmup-hairline', 'warmup-downstroke', 'warmup-compound']));
assert.equal(JSON.stringify(hands[0].groups[1].referenceIds), JSON.stringify(['sample-n']));
assert.equal(core.defaultPracticeSelection().handId, 'kurrent-basic');
assert.equal(core.defaultPracticeSelection().groupId, 'warmups');
assert.equal(core.defaultPracticeSelection().referenceId, 'warmup-hairline');
assert.equal(core.reference.glyph, 'hairline');
assert.equal(core.resolvePracticeSelection('kurrent-basic', 'lowercase-stems', '').referenceId, 'sample-n');
assert.equal(core.resolvePracticeSelection('missing', 'missing', 'missing').referenceId, 'warmup-hairline');
assert.ok(core.referencesForGroup('kurrent-basic', 'warmups').every(item => core.referenceById(item.id).strokes.length > 0));
const environment = core.environmentSnapshot();
assert.equal(environment.userAgent, 'TestBrowser/1.0 Firefox/140.0');
assert.equal(environment.platform, 'TestOS');
assert.equal(environment.maxTouchPoints, 5);
assert.equal(environment.devicePixelRatio, 2);
assert.equal(environment.pointerEvent, true);
assert.equal(environment.coalescedEvents, false);

const reference = {
  script: 'kurrent', glyph: 'n', canvas: { width: 1000, height: 1000, baseline: 700, xHeight: 400 },
  strokes: [
    { index: 0, hint: 'thin upstroke, pressure on downstroke', points: [{ x: 200, y: 700, p: 0.2, t: 0 }, { x: 260, y: 430, p: 0.3, t: 0.5 }, { x: 430, y: 700, p: 0.85, t: 1 }] },
    { index: 1, hint: 'finish with a light hairline', points: [{ x: 430, y: 700, p: 0.85, t: 0 }, { x: 500, y: 430, p: 0.4, t: 0.5 }, { x: 650, y: 700, p: 0.2, t: 1 }] }
  ]
};
const same = JSON.parse(JSON.stringify(reference.strokes));
const perfect = core.scoreAttempt(reference, same);
assert.equal(perfect.order.score, 100);
assert.ok(perfect.form.score > 95);
assert.ok(perfect.direction.score > 95);
assert.ok(perfect.pressure.score > 95);

element('pressureView').checked = true;
element('handSelect').value = 'kurrent-basic';
element('groupSelect').value = 'lowercase-stems';
element('glyphSelect').value = 'sample-n';
const exportPayload = core.exportAttemptPayload(reference, same);
assert.equal(exportPayload.settings.showPressure, true);
assert.equal(exportPayload.settings.mode, 'practice');
assert.equal(exportPayload.settings.selectedHandId, 'kurrent-basic');
assert.equal(exportPayload.settings.selectedGroupId, 'lowercase-stems');
assert.equal(exportPayload.settings.selectedReferenceId, 'sample-n');
assert.equal(exportPayload.settings.referenceScript, 'kurrent');
assert.equal(exportPayload.settings.referenceGlyph, 'n');
assert.equal(exportPayload.score.form.score, perfect.form.score);
assert.equal(exportPayload.score.order.score, perfect.order.score);
assert.equal(exportPayload.score.direction.score, perfect.direction.score);
assert.equal(exportPayload.score.pressure.confidence, perfect.pressure.confidence);
assert.equal(exportPayload.score.rhythm.label, 'Writing rhythm');
assert.equal(exportPayload.diagnostics.strokeSummary, '2 valid attempt / 2 reference');
assert.ok(exportPayload.diagnostics.pressureProfile, 'attempt export should include pressure profile diagnostics');
assert.equal(exportPayload.diagnostics.pressureProfile.rangeLabel, 'broad');
assert.ok(exportPayload.diagnostics.pressureProfile.rawMax > exportPayload.diagnostics.pressureProfile.rawMin);
assert.ok(exportPayload.diagnostics.pressureProfile.trimmedMax > exportPayload.diagnostics.pressureProfile.trimmedMin);
assert.ok(exportPayload.diagnostics.pressureProfile.p90 >= exportPayload.diagnostics.pressureProfile.median);
assert.equal(exportPayload.strokes.length, 2);

const compressedPressure = [{ index: 0, points: reference.strokes[0].points.map(p => ({ ...p, p: 0.1 + p.p * 0.35 })) }];
const compressedScore = core.scoreAttempt({ ...reference, strokes: [reference.strokes[0]] }, compressedPressure);
assert.ok(compressedScore.pressure.score > 90, 'same pressure shape in a compressed device range should still score well');

const offPathDownstroke = core.referenceById('warmup-downstroke');
const wanderingDownstroke = [{ index: 0, points: offPathDownstroke.strokes[0].points.map((p, i) => ({ ...p, x: p.x + (i === 1 ? 260 : 0) })) }];
const offPathScore = core.scoreAttempt(offPathDownstroke, wanderingDownstroke);
assert.ok(offPathScore.pressure.score > 90, 'pressure can be plausible when the path is wrong');
assert.ok(offPathScore.form.score < 75, 'fixture must be clearly off path');
assert.ok(offPathScore.feedback.includes('Pressure looks plausible, but the stroke path is off'), 'feedback should explain high pressure score on low form');

const reversedStroke = [JSON.parse(JSON.stringify(reference.strokes[0]))];
reversedStroke[0].points.reverse();
const reversed = core.scoreAttempt({ ...reference, strokes: [reference.strokes[0]] }, reversedStroke);
assert.ok(reversed.direction.score < 60, 'reversed stroke should primarily fail direction');

const swapped = core.scoreAttempt(reference, [same[1], same[0]]);
assert.ok(swapped.order.score < 60, 'swapped stroke order should fail order');
assert.ok(swapped.form.score > 90, 'swapped stroke order should preserve form after matching');

const invertedPressure = [JSON.parse(JSON.stringify(reference.strokes[0]))];
invertedPressure[0].points = invertedPressure[0].points.map(p => ({ ...p, p: 1 - p.p }));
const pressure = core.scoreAttempt({ ...reference, strokes: [reference.strokes[0]] }, invertedPressure);
assert.ok(pressure.pressure.score < 70, 'inverted pressure should fail pressure');

const diagnostics = core.diagnosticsFor(reference, same);
assert.equal(diagnostics.strokeSummary, '2 valid attempt / 2 reference');
assert.equal(diagnostics.pressureStatus, 'real');
assert.ok(diagnostics.pointCount > 0);
assert.ok(diagnostics.pressureMax > diagnostics.pressureMin);

const oneStrokeDiagnostics = core.diagnosticsFor(reference, [same[0]]);
assert.equal(oneStrokeDiagnostics.strokeSummary, '1 valid attempt / 2 reference');
assert.ok(oneStrokeDiagnostics.warnings.some(w => w.includes('Reference expects 2 strokes')));
const oneStrokeScore = core.scoreAttempt(reference, [same[0]]);
assert.equal(oneStrokeScore.direction.confidence, 'partial — stroke count mismatch');
assert.equal(oneStrokeScore.pressure.confidence, 'real · partial');
assert.ok(oneStrokeScore.feedback.includes('Reference expects 2 strokes'));

const accidentalTap = { index: 0, points: [{ x: 260, y: 508, p: 0.1, t: 1 }] };
const tapThenStroke = core.diagnosticsFor(reference, [accidentalTap, same[0]]);
assert.equal(tapThenStroke.strokeSummary, '1 valid attempt / 2 reference');
assert.equal(tapThenStroke.ignoredStrokeCount, 1);
assert.ok(tapThenStroke.warnings.some(w => w.includes('Ignored 1 tiny stroke')));

const scoredWithTap = core.scoreAttempt(reference, [accidentalTap, ...same]);
const scoredWithoutTap = core.scoreAttempt(reference, same);
assert.equal(scoredWithTap.order.score, scoredWithoutTap.order.score);
assert.ok(scoredWithTap.feedback.includes('Ignored 1 tiny stroke'));

const flatPressureStroke = [{ index: 0, points: reference.strokes[0].points.map(p => ({ ...p, p: 0.5 })) }];
const flatDiagnostics = core.diagnosticsFor({ ...reference, strokes: [reference.strokes[0]] }, flatPressureStroke);
assert.equal(flatDiagnostics.pressureStatus, 'flat');
assert.equal(flatDiagnostics.pressureProfile.levelLabel, 'medium');
assert.equal(flatDiagnostics.pressureProfile.variationLabel, 'flat');
assert.ok(flatDiagnostics.warnings.some(w => w.includes('Pressure variation is flat')));

const edgeNoisy = [{ index: 0, points: [
  { x: 0, y: 0, p: 0, t: 0 },
  { x: 10, y: 0, p: 0.2, t: 1 },
  { x: 20, y: 0, p: 0.8, t: 2 },
  { x: 30, y: 0, p: 1, t: 3 }
] }];
const edgeClean = [{ index: 0, points: [
  { x: 0, y: 0, p: 1, t: 0 },
  { x: 10, y: 0, p: 0.2, t: 1 },
  { x: 20, y: 0, p: 0.8, t: 2 },
  { x: 30, y: 0, p: 0, t: 3 }
] }];
const trimmedPressure = core.scoreAttempt({ ...reference, strokes: edgeClean }, edgeNoisy);
assert.ok(trimmedPressure.pressure.score > 95, 'pressure scoring should ignore noisy contact/lift samples');
assert.equal(trimmedPressure.pressure.confidence, 'real');
assert.equal(core.pressureWidthFor(0, 10, false), 10);
assert.equal(core.pressureWidthFor(0.5, 10, false), 10);
assert.ok(core.pressureWidthFor(0.15, 10, true) < core.pressureWidthFor(0.85, 10, true), 'pressure view should widen heavy segments');
assert.ok(core.pressureWidthFor(0.01, 10, true) >= 2, 'pressure width should clamp tiny contact samples');
assert.ok(core.pressureWidthFor(1, 10, true) <= 18, 'pressure width should cap very heavy strokes');
const sparseDiagnostics = core.diagnosticsFor({ ...reference, strokes: [reference.strokes[0]] }, [{ index: 0, points: [{ x: 0, y: 0, p: 0.5, t: 0 }] }]);
assert.equal(sparseDiagnostics.rhythmConfidence, 'sparse');
const interStrokePause = core.diagnosticsFor(reference, [
  { index: 0, points: [{ x: 0, y: 0, p: 0.3, t: 0 }, { x: 10, y: 0, p: 0.4, t: 17 }, { x: 20, y: 0, p: 0.5, t: 34 }] },
  { index: 1, points: [{ x: 100, y: 0, p: 0.4, t: 2034 }, { x: 110, y: 0, p: 0.5, t: 2051 }, { x: 120, y: 0, p: 0.6, t: 2068 }] }
]);
assert.equal(interStrokePause.rhythmConfidence, 'timing data: usable');
assert.equal(interStrokePause.maxDt, 17);
assert.equal(interStrokePause.maxInterStrokeGap, 2000);
assert.ok(interStrokePause.warnings.some(w => w.includes('Pause between strokes 2000 ms')));
assert.ok(!interStrokePause.warnings.some(w => w.includes('Sampling gap 2000')));
const inStrokePause = core.diagnosticsFor({ ...reference, strokes: [reference.strokes[0]] }, [
  { index: 0, points: [{ x: 0, y: 0, p: 0.3, t: 0 }, { x: 10, y: 0, p: 0.4, t: 17 }, { x: 20, y: 0, p: 0.5, t: 180 }] }
]);
assert.equal(inStrokePause.rhythmConfidence, 'timing data: noisy');
assert.ok(inStrokePause.warnings.some(w => w.includes('In-stroke sampling gap 163 ms')));

const refs = core.availableReferences();
const calibrationDir = new URL('../data/calibration/2026-08-05-firefox-android/', `file://${__filename}`);
function calibrationAttempt(name) { return JSON.parse(fs.readFileSync(new URL(name, calibrationDir), 'utf8')); }
const lightHairlineExport = calibrationAttempt('warmup-hairline-attempt-2.json');
const heavyHairlineExport = calibrationAttempt('warmup-hairline-attempt-3.json');
const heavyDownstrokeExport = calibrationAttempt('warmup-downstroke-attempt-1.json');
const lightDownstrokeExport = calibrationAttempt('warmup-downstroke-attempt-2.json');
const plausibleCompoundExport = calibrationAttempt('warmup-compound-curve-attempt-3.json');
const heavyCompoundExport = calibrationAttempt('warmup-compound-curve-attempt-4.json');
const normalKurrentExport = calibrationAttempt('kurrent-n-attempt-4.json');
const wrongCountKurrentExport = calibrationAttempt('kurrent-n-attempt-5.json');
assert.equal(core.pressureProfileFor(lightHairlineExport.strokes).levelLabel, 'low');
assert.equal(core.pressureProfileFor(lightHairlineExport.strokes).variationLabel, 'flat');
assert.equal(core.pressureProfileFor(heavyHairlineExport.strokes).levelLabel, 'high');
assert.equal(core.pressureProfileFor(lightDownstrokeExport.strokes).levelLabel, 'low');
assert.equal(core.pressureProfileFor(heavyDownstrokeExport.strokes).levelLabel, 'high');
assert.equal(core.pressureProfileFor(normalKurrentExport.strokes).variationLabel, 'useful');
assert.ok(core.scoreAttempt(core.referenceById('warmup-hairline'), lightHairlineExport.strokes).pressure.score > 80, 'light hairline should get a strong pressure score despite device-floor readings');
assert.ok(core.scoreAttempt(core.referenceById('warmup-hairline'), lightHairlineExport.strokes).pressure.score > core.scoreAttempt(core.referenceById('warmup-hairline'), heavyHairlineExport.strokes).pressure.score, 'light hairline should pressure-score better than heavy hairline');
assert.ok(core.scoreAttempt(core.referenceById('warmup-hairline'), heavyHairlineExport.strokes).feedback.includes('Hairline pressure stayed too heavy'));
assert.ok(core.scoreAttempt(core.referenceById('warmup-downstroke'), heavyDownstrokeExport.strokes).pressure.score > 80, 'heavy downstroke should get a strong pressure score even when pressure variation is flat');
assert.ok(core.scoreAttempt(core.referenceById('warmup-downstroke'), heavyDownstrokeExport.strokes).pressure.score > core.scoreAttempt(core.referenceById('warmup-downstroke'), lightDownstrokeExport.strokes).pressure.score, 'heavy downstroke should pressure-score better than light downstroke');
assert.ok(core.scoreAttempt(core.referenceById('warmup-downstroke'), lightDownstrokeExport.strokes).feedback.includes('Downstroke pressure stayed too light'));
assert.ok(core.scoreAttempt(core.referenceById('warmup-compound'), plausibleCompoundExport.strokes).pressure.score > core.scoreAttempt(core.referenceById('warmup-compound'), heavyCompoundExport.strokes).pressure.score, 'plausible compound should pressure-score better than heavy-throughout compound');
assert.ok(core.scoreAttempt(core.referenceById('warmup-compound'), heavyCompoundExport.strokes).feedback.includes('entry/exit stayed too heavy'));
assert.equal(core.scoreAttempt(core.referenceById('sample-n'), wrongCountKurrentExport.strokes).order.confidence, 'count mismatch');
assert.ok(core.scoreAttempt(core.referenceById('sample-n'), wrongCountKurrentExport.strokes).feedback.includes('Reference expects 2 strokes; attempt has 4'));
const hairline = core.referenceById('warmup-hairline');
const mediumHairline = [{ index: 0, points: hairline.strokes[0].points.map((p, i) => ({ ...p, p: i ? 0.5 : 0.4, t: i * 17 })) }];
const mediumHairlineScore = core.scoreAttempt(hairline, mediumHairline);
assert.ok(mediumHairlineScore.feedback.includes('Hairline pressure stayed too heavy'));
const compound = core.referenceById('warmup-compound');
const heavyCompound = [{ index: 0, points: compound.strokes[0].points.map((p, i) => ({ ...p, p: 0.75, t: i * 17 })) }];
const heavyCompoundScore = core.scoreAttempt(compound, heavyCompound);
assert.ok(heavyCompoundScore.feedback.includes('entry/exit stayed too heavy') || heavyCompoundScore.feedback.includes('Compound curve should read thin → thick → thin'));
assert.equal(JSON.stringify(refs.map(r => r.id)), JSON.stringify(['sample-n', 'warmup-hairline', 'warmup-downstroke', 'warmup-compound']));
assert.equal(core.referenceById('warmup-downstroke').glyph, 'downstroke');

const enriched = core.applyReferenceMetadata(reference, { hand: 'test hand', tool: 'Android pen', notes: 'first useful pressure run' });
assert.equal(enriched.hand, 'test hand');
assert.equal(enriched.tool, 'Android pen');
assert.equal(enriched.notes, 'first useful pressure run');

console.log('Ductus core regression tests passed');
