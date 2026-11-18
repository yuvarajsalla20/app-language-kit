import type { LanguageInfo } from './core';

/**
 * Ready languages: apps pick the ones they offer, in the order they want them listed.
 * Add more here (Kannada, Malayalam, Marathi ...) as apps need them.
 */
export const LANGUAGES = {
  en: { code: 'en', name: 'English', english: 'English' },
  ta: { code: 'ta', name: 'தமிழ்', english: 'Tamil' },
  te: { code: 'te', name: 'తెలుగు', english: 'Telugu' },
  hi: { code: 'hi', name: 'हिन्दी', english: 'Hindi' },
} as const satisfies Record<string, LanguageInfo>;

/**
 * Words every app needs, plus the Language page's own words. An app's own words are added on top, and an app can
 * replace any of these by using the same key. Native speakers should check new words before an app ships.
 */
export const COMMON_EN = {
  'language.title': 'Language',
  'language.sameAsPhone': 'Same as phone',
  'language.now': 'Now: {name}',
  'language.note': 'Names you type stay exactly as you typed them.',
  'common.back': 'Back',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.done': 'Done',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.search': 'Search',
  'common.settings': 'Settings',
  'common.home': 'Home',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.ok': 'OK',
  'common.close': 'Close',
  'common.retry': 'Try again',
  'common.loading': 'Loading…',
  'common.today': 'Today',
  'common.yesterday': 'Yesterday',
  'common.all': 'All',
  'common.clear': 'Clear',
  'common.other': 'Other',
} as const;

export type CommonKey = keyof typeof COMMON_EN;

export const COMMON_TA: Record<CommonKey, string> = {
  'language.title': 'மொழி',
  'language.sameAsPhone': 'போனின் மொழி',
  'language.now': 'இப்போது: {name}',
  'language.note': 'நீங்கள் எழுதிய பெயர்கள் அப்படியே இருக்கும்.',
  'common.back': 'பின்செல்',
  'common.save': 'சேமி',
  'common.cancel': 'ரத்து',
  'common.done': 'முடிந்தது',
  'common.delete': 'நீக்கு',
  'common.edit': 'திருத்து',
  'common.add': 'சேர்',
  'common.search': 'தேடு',
  'common.settings': 'அமைப்புகள்',
  'common.home': 'முகப்பு',
  'common.yes': 'ஆம்',
  'common.no': 'இல்லை',
  'common.ok': 'சரி',
  'common.close': 'மூடு',
  'common.retry': 'மீண்டும் முயல்க',
  'common.loading': 'ஏற்றுகிறது…',
  'common.today': 'இன்று',
  'common.yesterday': 'நேற்று',
  'common.all': 'அனைத்தும்',
  'common.clear': 'அழி',
  'common.other': 'மற்றவை',
};

export const COMMON_TE: Record<CommonKey, string> = {
  'language.title': 'భాష',
  'language.sameAsPhone': 'ఫోన్ భాష',
  'language.now': 'ఇప్పుడు: {name}',
  'language.note': 'మీరు రాసిన పేర్లు అలాగే ఉంటాయి.',
  'common.back': 'వెనుకకు',
  'common.save': 'సేవ్ చేయి',
  'common.cancel': 'రద్దు',
  'common.done': 'పూర్తయింది',
  'common.delete': 'తొలగించు',
  'common.edit': 'సవరించు',
  'common.add': 'జోడించు',
  'common.search': 'వెతుకు',
  'common.settings': 'సెట్టింగ్‌లు',
  'common.home': 'హోమ్',
  'common.yes': 'అవును',
  'common.no': 'కాదు',
  'common.ok': 'సరే',
  'common.close': 'మూసివేయి',
  'common.retry': 'మళ్ళీ ప్రయత్నించండి',
  'common.loading': 'లోడ్ అవుతోంది…',
  'common.today': 'ఈరోజు',
  'common.yesterday': 'నిన్న',
  'common.all': 'అన్నీ',
  'common.clear': 'తీసివేయి',
  'common.other': 'ఇతర',
};

export const COMMON_HI: Record<CommonKey, string> = {
  'language.title': 'भाषा',
  'language.sameAsPhone': 'फ़ोन की भाषा',
  'language.now': 'अभी: {name}',
  'language.note': 'आपके लिखे नाम वैसे ही रहेंगे।',
  'common.back': 'वापस',
  'common.save': 'सहेजें',
  'common.cancel': 'रद्द करें',
  'common.done': 'हो गया',
  'common.delete': 'हटाएँ',
  'common.edit': 'बदलें',
  'common.add': 'जोड़ें',
  'common.search': 'खोजें',
  'common.settings': 'सेटिंग्स',
  'common.home': 'होम',
  'common.yes': 'हाँ',
  'common.no': 'नहीं',
  'common.ok': 'ठीक है',
  'common.close': 'बंद करें',
  'common.retry': 'फिर से कोशिश करें',
  'common.loading': 'लोड हो रहा है…',
  'common.today': 'आज',
  'common.yesterday': 'कल',
  'common.all': 'सभी',
  'common.clear': 'साफ़ करें',
  'common.other': 'अन्य',
};

/** Common words by language code. */
export const COMMON_WORDS: Readonly<Record<string, Readonly<Record<string, string>>>> = { en: COMMON_EN, ta: COMMON_TA, te: COMMON_TE, hi: COMMON_HI };
