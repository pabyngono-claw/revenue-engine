import { JSDOM } from 'jsdom';

const fs = await import('fs');
const bundle = fs.readFileSync('dist/assets/index-CWGwpuDX.js', 'utf8');

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
  runScripts: "dangerously",
  resources: "usable",
  url: "https://revenue-engine-aa1.pages.dev/",
  pretendToBeVisual: true
});

const window = dom.window;
global.window = window;
global.document = window.document;
global.localStorage = window.localStorage;
global.fetch = window.fetch;
global.MutationObserver = window.MutationObserver;

// Capture errors
window.addEventListener('error', (e) => {
  console.log('ERROR:', e.message, e.filename, e.lineno, e.colno, e.error?.stack);
});

window.addEventListener('unhandledrejection', (e) => {
  console.log('UNHANDLED REJECTION:', e.reason);
});

console.log('Evaluating bundle...');
try {
  eval(bundle);
  console.log('Bundle evaluated successfully');
} catch (e) {
  console.log('EVAL ERROR:', e.message, e.stack);
}

// Wait a bit for async operations
await new Promise(r => setTimeout(r, 2000));
console.log('Done');
