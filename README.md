# app-language-kit

A language switch for React Native / Expo apps.

- A ready **Language page**: "Same as phone" first, then each language in its own script with its English name under it. Tap a row to choose it. No pop-ups.
- The choice is **saved on the phone** and the app changes at once, with no restart.
- `useT()` translates with `{slots}`. A missing word shows the fallback (English) word, so nothing breaks.
- **Common words** (Back, Save, Cancel, Done, Settings ...) come ready in English, Tamil and Telugu.
- **Opt-in and generic**: no app's own words are built in. `enabled={false}` keeps an app in its fallback language.

## Use

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createLanguageKit, LANGUAGES } from 'app-language-kit';

const en = { 'home.title': 'Home', 'home.count': '{n} items' } as const;

export const language = createLanguageKit({
  languages: [LANGUAGES.en, LANGUAGES.ta, LANGUAGES.te],
  base: en,
  words: { ta: { 'home.title': 'முகப்பு' }, te: { 'home.title': 'హోమ్' } },
  storage: AsyncStorage,
  storageKey: 'myapp.language',
  phoneLanguages: () => getLocales().map((l) => l.languageTag),
  usePalette, // optional: app-theme-kit's usePalette fits
});
export const { LanguageProvider, useT, useLanguage, useChoiceLabel, LanguagePage, translate } = language;
```

Wrap the app in `<LanguageProvider enabled={flag}>`. In a screen: `const t = useT(); t('home.count', { n: 3 })`.
Outside screens (PDFs, notifications): `translate('home.title')`.

Show `<LanguagePage />` as a Settings page and `useChoiceLabel()` as that row's value.

## Rules

- Keep saved data in one language (ids or English). Translate only when showing it.
- Names people type are never translated.
- Have a native speaker check new words before an app ships.
- `missingWords(dicts, 'en')` lists words a language still lacks: handy in an app's own test.

## Entry points

`app-language-kit` (everything), `app-language-kit/core` and `app-language-kit/common` (plain TypeScript, no React Native, for tests).
