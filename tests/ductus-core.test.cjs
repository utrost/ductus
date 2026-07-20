const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(new URL('../index.html', `file://${__filename}`), 'utf8');
assert.match(html, /<title>Ductus<\/title>/);
assert.match(html, /<link\s+rel="manifest"\s+href="\.\/manifest\.webmanifest"/);
assert.match(html, /navigator\.serviceWorker\.register\('\.\/sw\.js'\)/);
assert.match(html, /@media\s*\(max-width:\s*720px\)/);

const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.webmanifest', `file://${__filename}`), 'utf8'));
assert.equal(manifest.name, 'Ductus');
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.icons.some(icon => icon.src === './icons/icon-192.png'));
assert.ok(manifest.icons.some(icon => icon.src === './icons/icon-512.png'));

const sw = fs.readFileSync(new URL('../sw.js', `file://${__filename}`), 'utf8');
assert.match(sw, /PRECACHE_URLS/);
assert.match(sw, /'\.\/index\.html'/);
assert.match(sw, /event\.request\.mode\s*===\s*'navigate'/);

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
const window = { devicePixelRatio: 1, addEventListener: noop, removeEventListener: noop, matchMedia: () => ({ matches: false }) };
window.window = window; window.document = document;
const sandbox = { window, document, console, Date, Math, Number, String, Array, JSON, Blob: class Blob {}, URL: { createObjectURL: () => 'blob:test', revokeObjectURL: noop }, setTimeout, clearTimeout, innerWidth: 1000, innerHeight: 1000, alert: noop };
vm.createContext(sandbox);
vm.runInContext(scripts[0][1], sandbox, { filename: 'index.html' });
const core = window.__ductus;
assert.ok(core, 'Ductus should expose a headless test API');

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

console.log('Ductus core regression tests passed');
