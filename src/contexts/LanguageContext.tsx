import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/*  Language types                                                      */
/* ------------------------------------------------------------------ */
export type Language = 'he' | 'en';

export interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

/* ------------------------------------------------------------------ */
/*  Translation dictionaries                                            */
/* ------------------------------------------------------------------ */
const translations: Record<Language, Record<string, string>> = {
  he: {
    // App
    'app.title': 'פלאי גוף האדם',
    'app.subtitle': 'גלו את הסודות המדהימים של גוף האדם בחוויה אינטראקטיבית',
    'app.start': '🚀 בואו נתחיל לחקור!',

    // Level selector
    'level.kids': 'ילדים',
    'level.adults': 'מבוגרים',

    // View modes
    'view.surface': 'רגיל',
    'view.xray': 'רנטגן',
    'view.isolate': 'בידוד',

    // Focus zones
    'focus.full': 'מלא',
    'focus.head': 'ראש',
    'focus.chest': 'חזה',
    'focus.abdomen': 'בטן',
    'focus.legs': 'רגליים',

    // Body layers
    'layer.skin': 'עור',
    'layer.organs': 'איברים',
    'layer.skeleton': 'שלד',

    // Settings
    'settings.title': '⚙️ הגדרות',
    'settings.theme': 'ערכת נושא',
    'settings.language': 'שפה',
    'settings.layers': 'שכבות',
    'settings.button': 'הגדרות',

    // Organ panel
    'panel.whatIsIt': '📖 מה זה?',
    'panel.scientific': '📋 תיאור מדעי',
    'panel.didYouKnow': '💡 הידעת?',
    'panel.video': '🎬 סרטון',
    'panel.back': '← חזרה לגוף',
    'panel.latinName': '🏷️ שם לטיני',
    'panel.system': '🫀 מערכת',

    // Instructions
    'instructions': '👆 העבירו את העכבר על האיברים ולחצו כדי ללמוד עליהם',

    // Theme names
    'theme.space-dark': 'חלל כהה',
    'theme.ocean-dark': 'אוקיינוס עמוק',
    'theme.sunset-dark': 'שקיעה חמה',
    'theme.clinical-light': 'קליני בהיר',
    'theme.nature-light': 'טבע ירוק',
    'theme.golden-light': 'שמש זהובה',

    // Annotation labels
    'anno.aorta': 'אאורטה',
    'anno.pulmonary': 'עורק ריאתי',
    'anno.leftVentricle': 'חדר שמאלי',
    'anno.rightVentricle': 'חדר ימני',
    'anno.leftHemisphere': 'המיספרה שמאלית',
    'anno.rightHemisphere': 'המיספרה ימנית',
    'anno.cerebellum': 'מוחון',
    'anno.leftLung': 'ריאה שמאלית',
    'anno.rightLung': 'ריאה ימנית',
    'anno.trachea': 'קנה נשימה',
    'anno.fundus': 'קרקעית הקיבה',
    'anno.pylorus': 'השוער',
    'anno.iris': 'קשתית',
    'anno.pupil': 'אישון',
    'anno.outerEar': 'אוזן חיצונית',
    'anno.innerEar': 'אוזן פנימית',
  },
  en: {
    // App
    'app.title': 'Human Body Wonders',
    'app.subtitle': 'Discover the amazing secrets of the human body in an interactive experience',
    'app.start': '🚀 Let\'s start exploring!',

    // Level selector
    'level.kids': 'Kids',
    'level.adults': 'Adults',

    // View modes
    'view.surface': 'Normal',
    'view.xray': 'X-Ray',
    'view.isolate': 'Isolate',

    // Focus zones
    'focus.full': 'Full',
    'focus.head': 'Head',
    'focus.chest': 'Chest',
    'focus.abdomen': 'Abdomen',
    'focus.legs': 'Legs',

    // Body layers
    'layer.skin': 'Skin',
    'layer.organs': 'Organs',
    'layer.skeleton': 'Skeleton',

    // Settings
    'settings.title': '⚙️ Settings',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.layers': 'Layers',
    'settings.button': 'Settings',

    // Organ panel
    'panel.whatIsIt': '📖 What is it?',
    'panel.scientific': '📋 Scientific Description',
    'panel.didYouKnow': '💡 Did you know?',
    'panel.video': '🎬 Video',
    'panel.back': '← Back to body',
    'panel.latinName': '🏷️ Latin Name',
    'panel.system': '🫀 Body System',

    // Instructions
    'instructions': '👆 Hover over the organs and click to learn about them',

    // Theme names
    'theme.space-dark': 'Dark Space',
    'theme.ocean-dark': 'Deep Ocean',
    'theme.sunset-dark': 'Warm Sunset',
    'theme.clinical-light': 'Clinical Light',
    'theme.nature-light': 'Green Nature',
    'theme.golden-light': 'Golden Sun',

    // Annotation labels
    'anno.aorta': 'Aorta',
    'anno.pulmonary': 'Pulmonary Artery',
    'anno.leftVentricle': 'Left Ventricle',
    'anno.rightVentricle': 'Right Ventricle',
    'anno.leftHemisphere': 'Left Hemisphere',
    'anno.rightHemisphere': 'Right Hemisphere',
    'anno.cerebellum': 'Cerebellum',
    'anno.leftLung': 'Left Lung',
    'anno.rightLung': 'Right Lung',
    'anno.trachea': 'Trachea',
    'anno.fundus': 'Fundus',
    'anno.pylorus': 'Pylorus',
    'anno.iris': 'Iris',
    'anno.pupil': 'Pupil',
    'anno.outerEar': 'Outer Ear',
    'anno.innerEar': 'Inner Ear',
  },
};

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */
const LanguageContext = createContext<LanguageContextValue>({
  lang: 'he',
  setLang: () => {},
  t: (key: string) => key,
  isRTL: true,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('body-explorer-lang') as Language) || 'he';
  });

  const isRTL = lang === 'he';

  const t = (key: string): string => {
    return translations[lang][key] || translations['he'][key] || key;
  };

  useEffect(() => {
    localStorage.setItem('body-explorer-lang', lang);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
