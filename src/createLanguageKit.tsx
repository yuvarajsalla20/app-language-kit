import Feather from '@expo/vector-icons/Feather';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { AppState, Pressable, StyleSheet, Text as RNText, View, type TextProps } from 'react-native';
import { COMMON_EN, COMMON_WORDS, type CommonKey } from './common';
import { isLanguageChoice, makeTranslator, resolveLanguage, type LanguageChoice, type LanguageInfo, type Params, type Words } from './core';

/** Where the choice is kept (AsyncStorage fits). Leave it out and the choice lasts until the app closes. */
export interface LanguageStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

/** The colours the Language page uses. app-theme-kit's usePalette() already has all of them. */
export interface LanguagePageColors {
  card: string;
  line: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
}

const PLAIN_COLORS: LanguagePageColors = {
  card: '#FFFFFF',
  line: '#E3E3E3',
  text: '#1C1C1E',
  muted: '#6E6E73',
  accent: '#0A7AFF',
  accentSoft: '#E5F0FF',
  onAccent: '#FFFFFF',
};

export interface LanguageKitOptions<W extends Words> {
  /** The languages the app offers, in the order the Language page lists them. */
  languages: readonly LanguageInfo[];
  /** Shown when the phone's language isn't offered, and for any missing word. Default: the first language. */
  fallback?: string;
  /** The app's own words in the fallback language: the complete list. */
  base: W;
  /** The app's own words in the other languages, by code. A missing word shows the fallback word. */
  words?: Readonly<Record<string, Partial<Record<keyof W, string>>>>;
  storage?: LanguageStorage;
  /** Default 'app-language-kit.choice'. */
  storageKey?: string;
  /** Before anything is saved. Default 'system'. */
  initial?: LanguageChoice;
  /**
   * The phone's preferred languages, best first ('ta-IN', 'en-US'). Pass expo-localization's
   * `() => getLocales().map((l) => l.languageTag)`. Default: the JavaScript engine's own locale.
   */
  phoneLanguages?: () => readonly string[];
  /** The app's own Text (for its font) and colours hook. */
  components?: { Text?: ComponentType<TextProps> };
  usePalette?: () => LanguagePageColors;
}

const intlLocale = (): readonly string[] => {
  try {
    return [Intl.DateTimeFormat().resolvedOptions().locale];
  } catch {
    return [];
  }
};

/**
 * Makes the language setup for one app: `LanguageProvider` (wrap the app; `enabled={false}` keeps everything in the
 * fallback language and lets the app hide its Language row), `useT()` (the translator now), `useLanguage()` (choice,
 * setter, language in use) and `LanguagePage` (the ready Settings page, no pop-ups). `translate()` works outside
 * screens (PDFs, notifications) in the language in use.
 */
export function createLanguageKit<W extends Words>(options: LanguageKitOptions<W>) {
  const { languages, base, words = {}, storage, storageKey = 'app-language-kit.choice', initial = 'system' } = options;
  const fallback = options.fallback ?? languages[0]?.code ?? 'en';
  const codes = languages.map((l) => l.code);
  const Text = options.components?.Text ?? RNText;
  const usePageColors = options.usePalette ?? (() => PLAIN_COLORS);
  const readPhone = options.phoneLanguages ?? intlLocale;

  type Key = (keyof W & string) | CommonKey;
  type T = (key: Key, params?: Params) => string;

  // One full word list per language: common words, then the app's words on top.
  const dicts: Record<string, Words> = {};
  for (const code of codes) {
    dicts[code] = code === fallback ? { ...COMMON_EN, ...COMMON_WORDS[code], ...base } : { ...COMMON_WORDS[code], ...words[code] };
  }
  const translators: Record<string, T> = Object.fromEntries(codes.map((c) => [c, makeTranslator(dicts, c, fallback) as T]));
  const translatorFor = (code: string): T => translators[code] ?? translators[fallback]!;

  let current = fallback;
  /** Translate outside a screen, in the language in use now. */
  const translate: T = (key, params) => translatorFor(current)(key, params);
  const infoFor = (code: string) => languages.find((l) => l.code === code) ?? languages[0]!;

  interface Ctx {
    choice: LanguageChoice;
    setChoice: (c: LanguageChoice) => void;
    /** The language in use, e.g. 'ta'. */
    lang: string;
    /** The language the phone asks for, among the offered ones (what "Same as phone" gives). */
    phoneLang: string;
    enabled: boolean;
    t: T;
  }
  const LanguageContext = createContext<Ctx>({
    choice: initial,
    setChoice: () => {},
    lang: fallback,
    phoneLang: fallback,
    enabled: true,
    t: translatorFor(fallback),
  });

  function LanguageProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
    const [choice, setState] = useState<LanguageChoice>(initial);
    const [phone, setPhone] = useState<readonly string[]>(readPhone);
    useEffect(() => {
      storage
        ?.getItem(storageKey)
        .then((v) => {
          if (isLanguageChoice(v, codes)) setState(v);
        })
        .catch(() => {});
      // The phone's language can change while the app sits in the background.
      const sub = AppState.addEventListener('change', (s) => {
        if (s === 'active') setPhone(readPhone());
      });
      return () => sub.remove();
    }, []);
    const setChoice = useCallback((c: LanguageChoice) => {
      setState(c);
      storage?.setItem(storageKey, c).catch(() => {});
    }, []);
    const phoneLang = resolveLanguage('system', phone, codes, fallback);
    const lang = enabled ? resolveLanguage(choice, phone, codes, fallback) : fallback;
    current = lang;
    const value = useMemo(() => ({ choice, setChoice, lang, phoneLang, enabled, t: translatorFor(lang) }), [choice, setChoice, lang, phoneLang, enabled]);
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
  }

  const useLanguage = () => useContext(LanguageContext);
  const useT = (): T => useContext(LanguageContext).t;

  /** "Same as phone" or the language's own name, for a Settings row's value. */
  function useChoiceLabel(): string {
    const { choice, t } = useLanguage();
    return choice === 'system' ? t('language.sameAsPhone') : infoFor(choice).name;
  }

  /** The Language page body: "Same as phone", then each language in its own script with English under it. */
  function LanguagePage({ note }: { note?: string | null }) {
    const p = usePageColors();
    const { choice, setChoice, phoneLang, t } = useLanguage();
    const rows: { value: LanguageChoice; label: string; detail: string }[] = [
      { value: 'system', label: t('language.sameAsPhone'), detail: t('language.now', { name: infoFor(phoneLang).name }) },
      ...languages.map((l) => ({ value: l.code, label: l.name, detail: l.english })),
    ];
    const shownNote = note === undefined ? t('language.note') : note;
    return (
      <>
        <View style={[styles.card, { backgroundColor: p.card }]} accessibilityRole="radiogroup" accessibilityLabel={t('language.title')}>
          {rows.map((r, i) => {
            const on = choice === r.value;
            return (
              <Pressable
                key={r.value}
                onPress={() => setChoice(r.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${r.label}, ${r.detail}`}
                style={[styles.row, i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: p.line }]}
              >
                <View style={styles.words}>
                  <Text style={[styles.label, { color: p.text }]}>{r.label}</Text>
                  <Text style={[styles.detail, { color: p.muted }]}>{r.detail}</Text>
                </View>
                {on ? (
                  <View style={[styles.tick, { backgroundColor: p.accent }]}>
                    <Feather name="check" size={14} color={p.onAccent} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        {shownNote ? <Text style={[styles.note, { color: p.muted }]}>{shownNote}</Text> : null}
      </>
    );
  }

  return { LanguageProvider, useLanguage, useT, useChoiceLabel, LanguagePage, translate, translatorFor, languages, fallback };
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 60 },
  words: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600' },
  detail: { fontSize: 12, marginTop: 2 },
  tick: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  note: { fontSize: 13, marginTop: 10, marginHorizontal: 4, lineHeight: 18 },
});
