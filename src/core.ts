/**
 * The plain parts of the kit (no React, no React Native), so tests and non-screen code can use them.
 */

/** 'system' follows the phone's language; anything else is a language code such as 'en', 'ta' or 'te'. */
export type LanguageChoice = 'system' | (string & {});

/** One language an app offers. */
export interface LanguageInfo {
  /** Short code: 'en', 'ta', 'te', 'hi' ... (the first part of a phone language tag like 'ta-IN'). */
  code: string;
  /** The language's name in its own script: 'English', 'தமிழ்', 'తెలుగు'. */
  name: string;
  /** The name in English, shown under `name`: 'Tamil', 'Telugu'. */
  english: string;
}

/** Words for one language: key -> text. Text may hold {name} slots, filled from params. */
export type Words = Readonly<Record<string, string>>;
export type Params = Readonly<Record<string, string | number>>;

/** 'ta-IN' -> 'ta', 'zh_Hant_TW' -> 'zh'. */
export const baseCode = (tag: string): string => tag.toLowerCase().split(/[-_]/)[0] ?? '';

export const isLanguageChoice = (v: unknown, codes: readonly string[]): v is LanguageChoice =>
  v === 'system' || (typeof v === 'string' && codes.includes(v));

/**
 * Which language to show. A fixed choice wins if the app offers it; 'system' takes the phone's first preferred
 * language the app offers; otherwise the fallback.
 */
export function resolveLanguage(choice: LanguageChoice, phone: readonly string[], codes: readonly string[], fallback: string): string {
  if (choice !== 'system' && codes.includes(choice)) return choice;
  for (const tag of phone) {
    const code = baseCode(tag);
    if (codes.includes(code)) return code;
  }
  return fallback;
}

/** Fills {slots}: fill('Now: {name}', { name: 'English' }) -> 'Now: English'. Unknown slots stay as they are. */
export const fill = (text: string, params?: Params): string =>
  params ? text.replace(/\{(\w+)\}/g, (all, k: string) => (k in params ? String(params[k]) : all)) : text;

/**
 * A translator for one language: its own word, else the fallback language's word, else the key itself
 * (so a missing word shows up plainly instead of crashing).
 */
export function makeTranslator(dicts: Readonly<Record<string, Words>>, lang: string, fallback: string) {
  const own = dicts[lang] ?? {};
  const base = dicts[fallback] ?? {};
  return (key: string, params?: Params): string => fill(own[key] ?? base[key] ?? key, params);
}

/** Keys the fallback language has but another language is missing: handy in an app's own test. */
export function missingWords(dicts: Readonly<Record<string, Words>>, fallback: string): Record<string, string[]> {
  const base = Object.keys(dicts[fallback] ?? {});
  const out: Record<string, string[]> = {};
  for (const [code, words] of Object.entries(dicts)) {
    if (code === fallback) continue;
    const gaps = base.filter((k) => !(k in words));
    if (gaps.length) out[code] = gaps;
  }
  return out;
}
