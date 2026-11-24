import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const pages = ['index.html', 'ru/index.html'];

function readPage(path) {
  return readFileSync(new URL(path, root), 'utf8');
}

test('both pages carry the same sections in the same order', () => {
  const ids = (html) => [...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);
  for (const page of pages) {
    assert.deepEqual(ids(readPage(page)), ['what', 'beta', 'signup', 'data']);
  }
});

test('each page names its language and links both versions', () => {
  assert.match(readPage('index.html'), /<html lang="en">/);
  assert.match(readPage('ru/index.html'), /<html lang="ru">/);
  for (const page of pages) {
    const html = readPage(page);
    assert.match(html, /hreflang="en" href="https:\/\/frostwise\.app\/"/);
    assert.match(html, /hreflang="ru" href="https:\/\/frostwise\.app\/ru\/"/);
    assert.match(html, /hreflang="x-default" href="https:\/\/frostwise\.app\/"/);
  }
});

test('nothing is loaded from another host but the form', () => {
  for (const file of [...pages, 'styles.css']) {
    const hosts = [...readPage(file).matchAll(/(?:src|href)="https:\/\/([^/"]+)/g)]
      .map((m) => m[1])
      .filter((host) => host !== 'frostwise.app' && host !== 'docs.google.com');
    assert.deepEqual([...new Set(hosts)], [], file);
  }
  assert.doesNotMatch(readPage('styles.css'), /url\(["']?https?:/);
});

test('the pages run no scripts', () => {
  for (const page of pages) assert.doesNotMatch(readPage(page), /<script/);
});

test('body text is at least 16px and targets at least 48px', () => {
  const css = readPage('styles.css');
  assert.match(css, /body\s*{[^}]*font-size:\s*(1[6-9]|2\d)px/);
  assert.match(css, /--target:\s*48px/);
});

// \b knows only ASCII word characters, so the Russian words are bounded by \p{L} instead.
const beyondBeta =
  /\bAI\b|(?<!\p{L})ИИ(?!\p{L})|нейросет|искусственн|iPhone|iOS|premium|подписк[аиу] за/iu;

test('the beta check catches promises in either language', () => {
  for (const claim of ['an AI helper', 'помощник на ИИ.', 'нейросеть подскажет', 'on iPhone']) {
    assert.match(claim, beyondBeta, claim);
  }
  assert.doesNotMatch('Detailed plan, без подписок', beyondBeta);
});

test('the copy promises nothing beyond the beta', () => {
  for (const page of pages) assert.doesNotMatch(readPage(page), beyondBeta);
});

test('each page shares a title, a description and an image', () => {
  for (const page of pages) {
    const html = readPage(page);
    assert.match(html, /<meta property="og:title" content="[^"]+">/);
    assert.match(html, /<meta property="og:description" content="[^"]+">/);
    assert.match(html, /<meta property="og:image" content="https:\/\/frostwise\.app\/og\.png">/);
  }
});

test('the form has a plain link beside its frame', () => {
  for (const page of pages) {
    const signup = readPage(page).split('<section id="signup"')[1].split('</section>')[0];
    assert.match(signup, /<iframe class="form-frame"/);
    assert.match(signup, /<a class="form-link"/);
  }
});

test('both forms are linked, each in its own language', () => {
  const form = /https:\/\/docs\.google\.com\/forms\/d\/e\/([\w-]+)\/viewform/g;
  const en = [...readPage('index.html').matchAll(form)].map((m) => m[1]);
  const ru = [...readPage('ru/index.html').matchAll(form)].map((m) => m[1]);
  assert.equal(new Set(en).size, 1);
  assert.equal(new Set(ru).size, 1);
  assert.notEqual(en[0], ru[0]);
  for (const page of pages) assert.doesNotMatch(readPage(page), /FORM_URL_/);
});

test('a way out of a blank or sign-in frame comes before the frame', () => {
  for (const page of pages) {
    const signup = readPage(page).split('<section id="signup"')[1].split('</section>')[0];
    const hint = signup.indexOf('<p class="form-hint">');
    assert.ok(hint !== -1 && hint < signup.indexOf('<iframe'), page);
    assert.match(signup.slice(hint, signup.indexOf('<iframe')), /<a class="form-link"/);
  }
});

test('the domain file names frostwise.app', () => {
  assert.equal(readPage('CNAME').trim(), 'frostwise.app');
});
