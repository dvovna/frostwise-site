import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const pages = ['index.html', 'ru/index.html'];
const policies = ['privacy/index.html', 'ru/privacy/index.html'];
const all = [...pages, ...policies];

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
  const versions = [
    { en: 'index.html', ru: 'ru/index.html', path: '' },
    { en: 'privacy/index.html', ru: 'ru/privacy/index.html', path: 'privacy/' },
  ];
  for (const { en, ru, path } of versions) {
    assert.match(readPage(en), /<html lang="en">/);
    assert.match(readPage(ru), /<html lang="ru">/);
    for (const page of [en, ru]) {
      const html = readPage(page);
      assert.ok(html.includes(`hreflang="en" href="https://frostwise.app/${path}"`), page);
      assert.ok(html.includes(`hreflang="ru" href="https://frostwise.app/ru/${path}"`), page);
      assert.ok(html.includes(`hreflang="x-default" href="https://frostwise.app/${path}"`), page);
    }
  }
});

// Links may lead anywhere (the policy links each processor's own); what a page loads may not.
test('nothing is loaded from another host but the form', () => {
  for (const file of [...all, 'styles.css']) {
    const hosts = [...readPage(file).matchAll(/(?:src="|<link [^>]*href=")https:\/\/([^/"]+)/g)]
      .map((m) => m[1])
      .filter((host) => host !== 'frostwise.app' && host !== 'docs.google.com');
    assert.deepEqual([...new Set(hosts)], [], file);
  }
  assert.doesNotMatch(readPage('styles.css'), /url\(["']?https?:/);
});

test('the pages run no scripts', () => {
  for (const page of all) assert.doesNotMatch(readPage(page), /<script/);
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
  for (const page of all) assert.doesNotMatch(readPage(page), beyondBeta);
});

test('each page shares a title, a description and an image', () => {
  for (const page of all) {
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

function footer(page) {
  return readPage(page).split('<footer')[1].split('</footer>')[0];
}

function section(page, id) {
  return readPage(page).split(`<section id="${id}"`)[1].split('</section>')[0];
}

test('the home pages link the policy in their own language', () => {
  assert.match(footer('index.html'), /<a href="\/privacy\/">/);
  assert.match(footer('ru/index.html'), /<a href="\/ru\/privacy\/">/);
});

test('both policies carry the same sections in the same order', () => {
  const ids = (html) => [...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);
  const en = ids(readPage(policies[0]));
  assert.deepEqual(en, [
    'summary',
    'who',
    'app',
    'never',
    'processors',
    'retention',
    'delete',
    'rights',
    'children',
    'site',
    'changes',
  ]);
  assert.deepEqual(ids(readPage(policies[1])), en);
});

test('each policy says how to delete the account and whom to write to', () => {
  for (const page of policies) {
    const remove = section(page, 'delete');
    assert.match(remove, /href="https:\/\/api\.frostwise\.app\/v1\/account\/delete"/, page);
    assert.match(remove, /href="mailto:support@frostwise\.app"/, page);
    assert.match(section(page, 'who'), /href="mailto:support@frostwise\.app"/, page);
  }
});

test('both policies name the same processors', () => {
  const names = (page) =>
    [...section(page, 'processors').matchAll(/<tr><td><a href="[^"]+">([^<]+)<\/a>/g)].map(
      (m) => m[1],
    );
  const en = names(policies[0]);
  for (const name of [
    'Fly.io',
    'Backblaze',
    'Sentry',
    'Google',
    'Expo',
    'Open-Meteo',
    'OpenStreetMap Foundation',
  ]) {
    assert.ok(en.includes(name), name);
  }
  assert.deepEqual(names(policies[1]), en);
});

test('the policy pages lead home in their language', () => {
  assert.match(readPage('privacy/index.html'), /<a class="wordmark" href="\/">/);
  assert.match(readPage('ru/privacy/index.html'), /<a class="wordmark" href="\/ru\/">/);
});
