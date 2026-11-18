import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COMMON_EN, COMMON_WORDS, LANGUAGES } from '../src/common';
import { baseCode, fill, isLanguageChoice, makeTranslator, missingWords, resolveLanguage } from '../src/core';
import { KIT_VERSION } from '../src/kit';

const CODES = ['en', 'ta', 'te'];

describe('kit', () => {
  it('KIT_VERSION matches package.json', () => {
    expect(KIT_VERSION).toBe(JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version);
  });
});

describe('resolveLanguage', () => {
  it('a fixed choice wins', () => {
    expect(resolveLanguage('te', ['ta-IN'], CODES, 'en')).toBe('te');
  });
  it('same as phone takes the first offered phone language', () => {
    expect(resolveLanguage('system', ['hi-IN', 'ta-IN', 'en-US'], CODES, 'en')).toBe('ta');
    expect(resolveLanguage('system', ['te_IN'], CODES, 'en')).toBe('te');
  });
  it('falls back when nothing matches or the choice is unknown', () => {
    expect(resolveLanguage('system', ['fr-FR'], CODES, 'en')).toBe('en');
    expect(resolveLanguage('system', [], CODES, 'en')).toBe('en');
    expect(resolveLanguage('kn', ['fr'], CODES, 'en')).toBe('en');
  });
  it('baseCode and isLanguageChoice', () => {
    expect(baseCode('TA-in')).toBe('ta');
    expect(isLanguageChoice('system', CODES)).toBe(true);
    expect(isLanguageChoice('ta', CODES)).toBe(true);
    expect(isLanguageChoice('kn', CODES)).toBe(false);
    expect(isLanguageChoice(null, CODES)).toBe(false);
  });
});

describe('translator', () => {
  const dicts = { en: { hi: 'Hello {name}', only: 'English only' }, ta: { hi: 'வணக்கம் {name}' } };
  it('fills slots and falls back word by word', () => {
    const t = makeTranslator(dicts, 'ta', 'en');
    expect(t('hi', { name: 'Ravi' })).toBe('வணக்கம் Ravi');
    expect(t('only')).toBe('English only');
    expect(t('nope')).toBe('nope');
  });
  it('fill leaves unknown slots', () => {
    expect(fill('{a} and {b}', { a: 1 })).toBe('1 and {b}');
    expect(fill('plain')).toBe('plain');
  });
  it('missingWords lists gaps', () => {
    expect(missingWords(dicts, 'en')).toEqual({ ta: ['only'] });
  });
});

describe('common words', () => {
  it('Tamil and Telugu have every common word', () => {
    expect(missingWords(COMMON_WORDS, 'en')).toEqual({});
    for (const code of ['ta', 'te']) for (const k of Object.keys(COMMON_EN)) expect(COMMON_WORDS[code]![k]!.length).toBeGreaterThan(0);
  });
  it('languages show their own names', () => {
    expect(LANGUAGES.ta.name).toBe('தமிழ்');
    expect(LANGUAGES.te.english).toBe('Telugu');
  });
});
