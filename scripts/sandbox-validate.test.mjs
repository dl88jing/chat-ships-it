import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWidgetHtml } from '../src/lib/sandbox-validate.ts';
import { pickTemplate } from '../src/lib/widgets.ts';

test('clean duck-like widget HTML passes validation', () => {
  const result = validateWidgetHtml('<!doctype html><html><body><div>🦆</div></body></html>');
  assert.deepEqual(result, { ok: true, errors: [] });
});

test('fetch is rejected', () => {
  const result = validateWidgetHtml('<script>fetch("https://example.com")</script>');
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /fetch/);
});

test('oversized HTML is rejected', () => {
  const result = validateWidgetHtml(`<html>${'x'.repeat(12_001)}</html>`);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /12,000/);
});

test('sub goal thermometer request picks the new template', () => {
  const template = pickTemplate('sub goal thermometer');
  assert.equal(template.id, 'sub-goal');
});
