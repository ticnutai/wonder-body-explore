import type { Language } from '@/contexts/LanguageContext';

export type Level = 'kids' | 'adults';

/* ------------------------------------------------------------------ */
/*  Bilingual organ content                                             */
/* ------------------------------------------------------------------ */
export interface OrganContent {
  description: string;
  funFact: string;
  videoId: string;
}

export interface OrganAnnotation {
  id: string;
  offset: [number, number, number];   // relative to organ position
  label: Record<Language, string>;
}

export interface OrganInfo {
  id: string;
  name: Record<Language, string>;
  latinName: string;                   // TA2 anatomical Latin name
  bodySystem: Record<Language, string>; // which body system it belongs to
  emoji: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  hoverColor: string;
  annotations: OrganAnnotation[];      // sub-part labels (BioDigital/TA2 inspired)
  kids: Record<Language, OrganContent>;
  adults: Record<Language, OrganContent>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
export function getOrganName(organ: OrganInfo, lang: Language): string {
  return organ.name[lang];
}

export function getOrganContent(organ: OrganInfo, level: Level, lang: Language): OrganContent {
  return organ[level][lang];
}

/* ------------------------------------------------------------------ */
/*  Organs data                                                         */
/* ------------------------------------------------------------------ */
export const organs: OrganInfo[] = [
  {
    id: 'brain',
    name: { he: 'מוח', en: 'Brain' },
    latinName: 'Encephalon',
    bodySystem: { he: 'מערכת העצבים', en: 'Nervous System' },
    emoji: '🧠',
    position: [0, 2.35, 0],
    scale: [0.55, 0.45, 0.5],
    color: '#ff9ecd',
    hoverColor: '#ffb8db',
    annotations: [
      { id: 'leftHemisphere', offset: [-0.25, 0.1, 0.15], label: { he: 'המיספרה שמאלית', en: 'Left Hemisphere' } },
      { id: 'rightHemisphere', offset: [0.25, 0.1, 0.15], label: { he: 'המיספרה ימנית', en: 'Right Hemisphere' } },
      { id: 'cerebellum', offset: [0, -0.15, -0.2], label: { he: 'מוחון', en: 'Cerebellum' } },
    ],
    kids: {
      he: {
        description: 'המוח הוא כמו מחשב-על שנמצא בתוך הראש שלנו! הוא עוזר לנו לחשוב, לזכור, לחלום, ולשלוט בכל הגוף. בלי המוח, לא יכולנו לדבר, לשחק, או אפילו לנשום!',
        funFact: 'המוח שלנו שוקל בערך 1.4 קילו - כמו משקל של אננס! 🍍',
        videoId: 'JFqiSr9o-Ls',
      },
      en: {
        description: 'The brain is like a supercomputer inside our head! It helps us think, remember, dream, and control our entire body. Without the brain, we couldn\'t talk, play, or even breathe!',
        funFact: 'Our brain weighs about 1.4 kg — about the same as a pineapple! 🍍',
        videoId: 'JFqiSr9o-Ls',
      },
    },
    adults: {
      he: {
        description: 'המוח האנושי הוא האיבר המורכב ביותר בגוף, מכיל כ-86 מיליארד תאי עצב (נוירונים) המחוברים ביניהם בטריליוני סינפסות. הוא אחראי על עיבוד מידע חושי, שליטה מוטורית, זיכרון, רגשות, ותהליכי חשיבה מורכבים. המוח צורך כ-20% מהאנרגיה של הגוף למרות שהוא מהווה רק 2% ממשקל הגוף.',
        funFact: 'המוח מייצר מספיק חשמל בזמן ערות כדי להדליק נורת LED קטנה - כ-23 וואט של הספק חשמלי.',
        videoId: 'JFqiSr9o-Ls',
      },
      en: {
        description: 'The human brain is the most complex organ in the body, containing approximately 86 billion nerve cells (neurons) connected by trillions of synapses. It is responsible for processing sensory information, motor control, memory, emotions, and complex thinking. The brain consumes about 20% of the body\'s energy despite making up only 2% of body weight.',
        funFact: 'The brain generates enough electricity while awake to power a small LED light — about 23 watts of power.',
        videoId: 'JFqiSr9o-Ls',
      },
    },
  },
  {
    id: 'eyes',
    name: { he: 'עיניים', en: 'Eyes' },
    latinName: 'Oculus',
    bodySystem: { he: 'מערכת החושים', en: 'Sensory System' },
    emoji: '👁️',
    position: [0, 2.25, 0.38],
    scale: [0.55, 0.18, 0.18],
    color: '#64b5f6',
    hoverColor: '#90caf9',
    annotations: [
      { id: 'iris', offset: [0, 0, 0.1], label: { he: 'קשתית', en: 'Iris' } },
      { id: 'pupil', offset: [0, 0, 0.15], label: { he: 'אישון', en: 'Pupil' } },
    ],
    kids: {
      he: {
        description: 'העיניים הן כמו מצלמות קסומות! הן קולטות אור ושולחות תמונות למוח, ככה אנחנו רואים את כל העולם הצבעוני סביבנו - פרחים, חברים, וכוכבים בשמיים!',
        funFact: 'העין יכולה להבחין בין כ-10 מיליון צבעים שונים! 🌈',
        videoId: 'syTz2gFa_GY',
      },
      en: {
        description: 'Eyes are like magical cameras! They capture light and send images to the brain, so we can see the colorful world around us — flowers, friends, and stars in the sky!',
        funFact: 'The eye can distinguish between about 10 million different colors! 🌈',
        videoId: 'syTz2gFa_GY',
      },
    },
    adults: {
      he: {
        description: 'העין האנושית היא איבר חושי מורכב הפועל בעקרון דומה למצלמה. הקרנית והעדשה מכוונות אור על הרשתית, שם כ-120 מיליון תאי קולטן (מוטות ומדוכים) ממירים אור לאותות עצביים. עצב הראייה מעביר את המידע לקורטקס הראייתי במוח לעיבוד.',
        funFact: 'שרירי העין הם השרירים הפעילים ביותר בגוף - הם מבצעים יותר מ-100,000 תנועות ביום.',
        videoId: 'syTz2gFa_GY',
      },
      en: {
        description: 'The human eye is a complex sensory organ that works similarly to a camera. The cornea and lens focus light onto the retina, where about 120 million photoreceptor cells (rods and cones) convert light into nerve signals. The optic nerve transmits this information to the visual cortex in the brain for processing.',
        funFact: 'The eye muscles are the most active muscles in the body — they perform over 100,000 movements per day.',
        videoId: 'syTz2gFa_GY',
      },
    },
  },
  {
    id: 'ears',
    name: { he: 'אוזניים', en: 'Ears' },
    latinName: 'Auris',
    bodySystem: { he: 'מערכת החושים', en: 'Sensory System' },
    emoji: '👂',
    position: [0, 2.3, 0],
    scale: [0.85, 0.22, 0.25],
    color: '#ffcc80',
    hoverColor: '#ffdd99',
    annotations: [
      { id: 'outerEar', offset: [0.35, 0, 0.05], label: { he: 'אוזן חיצונית', en: 'Outer Ear' } },
      { id: 'innerEar', offset: [-0.35, 0, 0.05], label: { he: 'אוזן פנימית', en: 'Inner Ear' } },
    ],
    kids: {
      he: {
        description: 'האוזניים עוזרות לנו לשמוע את כל הצלילים מסביבנו - מוזיקה, צחוק של חברים, וציוץ ציפורים! בפנים האוזן יש חלקים קטנטנים שרוטטים כשקול מגיע אליהם.',
        funFact: 'האוזן הפנימית מכילה את העצם הכי קטנה בגוף - עצם הסנדן, שקטנה מגרגר אורז! 🦴',
        videoId: 'flVFxEqwJsU',
      },
      en: {
        description: 'Ears help us hear all the sounds around us — music, friends laughing, and birds singing! Inside the ear there are tiny parts that vibrate when sound reaches them.',
        funFact: 'The inner ear contains the smallest bone in the body — the stapes, smaller than a grain of rice! 🦴',
        videoId: 'flVFxEqwJsU',
      },
    },
    adults: {
      he: {
        description: 'מערכת השמיעה כוללת שלושה חלקים: האוזן החיצונית אוספת גלי קול, האוזן התיכונה מגבירה רעידות דרך שלוש עצמות (פטיש, סנדן ושרביט), והאוזן הפנימית (השבלול) ממירה רעידות לאותות חשמליים. האוזן הפנימית גם אחראית על שיווי המשקל.',
        funFact: 'השבלול באוזן הפנימית, אם היה נפרש, היה באורך של כ-3 ס"מ ומכיל כ-15,000 תאי שיער.',
        videoId: 'flVFxEqwJsU',
      },
      en: {
        description: 'The auditory system includes three parts: the outer ear collects sound waves, the middle ear amplifies vibrations through three bones (hammer, anvil, and stirrup), and the inner ear (cochlea) converts vibrations to electrical signals. The inner ear is also responsible for balance.',
        funFact: 'The cochlea in the inner ear, if uncoiled, would be about 3 cm long and contains about 15,000 hair cells.',
        videoId: 'flVFxEqwJsU',
      },
    },
  },
  {
    id: 'heart',
    name: { he: 'לב', en: 'Heart' },
    latinName: 'Cor',
    bodySystem: { he: 'מערכת הדם', en: 'Cardiovascular System' },
    emoji: '❤️',
    position: [0.12, 1.4, 0.18],
    scale: [0.32, 0.32, 0.28],
    color: '#ef5350',
    hoverColor: '#ff6b6b',
    annotations: [
      { id: 'aorta', offset: [0.05, 0.35, 0.05], label: { he: 'אאורטה', en: 'Aorta' } },
      { id: 'pulmonary', offset: [-0.15, 0.3, 0.1], label: { he: 'עורק ריאתי', en: 'Pulmonary Artery' } },
      { id: 'leftVentricle', offset: [0.12, -0.1, 0.12], label: { he: 'חדר שמאלי', en: 'Left Ventricle' } },
      { id: 'rightVentricle', offset: [-0.12, -0.1, 0.12], label: { he: 'חדר ימני', en: 'Right Ventricle' } },
    ],
    kids: {
      he: {
        description: 'הלב הוא כמו משאבה חזקה שעובדת בלי הפסקה! הוא שולח דם לכל חלקי הגוף, ככה כל התאים מקבלים אוכל וחמצן. הלב פועם כ-100,000 פעמים ביום!',
        funFact: 'הלב שלך בגודל של האגרוף שלך! 👊 ועד גיל 70 הוא יפעם בערך 2.5 מיליארד פעמים!',
        videoId: 'JnbIPRhERqA',
      },
      en: {
        description: 'The heart is like a powerful pump that never stops! It sends blood to every part of the body, so all cells get food and oxygen. The heart beats about 100,000 times a day!',
        funFact: 'Your heart is about the size of your fist! 👊 By age 70, it will have beaten about 2.5 billion times!',
        videoId: 'JnbIPRhERqA',
      },
    },
    adults: {
      he: {
        description: 'הלב הוא שריר חלול בעל 4 חדרים (2 עליות ו-2 חדרים) הפועל כמשאבה כפולה. הצד הימני שואב דם דל-חמצן ושולח אותו לריאות, והצד השמאלי שואב דם עשיר בחמצן ומפיץ אותו בגוף. הלב פועם בממוצע 72 פעמים בדקה.',
        funFact: 'לב האדם מזרים כ-7,500 ליטר דם ביום - מספיק למלא כ-37 אמבטיות!',
        videoId: 'JnbIPRhERqA',
      },
      en: {
        description: 'The heart is a hollow muscle with 4 chambers (2 atria and 2 ventricles) functioning as a double pump. The right side draws oxygen-poor blood and sends it to the lungs, while the left side draws oxygen-rich blood and distributes it throughout the body. The heart beats an average of 72 times per minute.',
        funFact: 'The human heart pumps about 7,500 liters of blood per day — enough to fill about 37 bathtubs!',
        videoId: 'JnbIPRhERqA',
      },
    },
  },
  {
    id: 'lungs',
    name: { he: 'ריאות', en: 'Lungs' },
    latinName: 'Pulmo',
    bodySystem: { he: 'מערכת הנשימה', en: 'Respiratory System' },
    emoji: '🫁',
    position: [0, 1.45, 0.08],
    scale: [0.7, 0.48, 0.3],
    color: '#80cbc4',
    hoverColor: '#a7e0db',
    annotations: [
      { id: 'leftLung', offset: [-0.25, 0, 0.08], label: { he: 'ריאה שמאלית', en: 'Left Lung' } },
      { id: 'rightLung', offset: [0.25, 0, 0.08], label: { he: 'ריאה ימנית', en: 'Right Lung' } },
      { id: 'trachea', offset: [0, 0.35, 0.05], label: { he: 'קנה נשימה', en: 'Trachea' } },
    ],
    kids: {
      he: {
        description: 'הריאות הן כמו בלונים קסומים בתוך החזה! כשאנחנו נושמים פנימה, הן מתמלאות באוויר ולוקחות ממנו חמצן. כשאנחנו נושמים החוצה, הן שולחות אוויר משומש. הן עובדות כל הזמן, גם כשאנחנו ישנים!',
        funFact: 'אם היינו פורשים את כל הנאדיות (בועות אוויר קטנטנות) בריאות, הן היו מכסות מגרש טניס שלם! 🎾',
        videoId: 'yv3W1dGMYpo',
      },
      en: {
        description: 'Lungs are like magical balloons inside your chest! When you breathe in, they fill with air and take oxygen from it. When you breathe out, they push out used air. They work all the time, even while you sleep!',
        funFact: 'If you spread out all the alveoli (tiny air bubbles) in the lungs, they would cover a whole tennis court! 🎾',
        videoId: 'yv3W1dGMYpo',
      },
    },
    adults: {
      he: {
        description: 'הריאות הן איברי הנשימה העיקריים, מכילות כ-300-500 מיליון נאדיות (אלוואולי) המספקות שטח פנים של כ-70 מ"ר לחילוף גזים. בכל נשימה נכנסים כ-500 מ"ל אוויר, ובממוצע אנחנו נושמים 12-20 נשימות בדקה. הדיאפרגמה היא השריר העיקרי שמניע את תהליך הנשימה.',
        funFact: 'הריאה השמאלית קטנה ב-10% מהימנית - כדי לפנות מקום ללב.',
        videoId: 'yv3W1dGMYpo',
      },
      en: {
        description: 'The lungs are the primary respiratory organs, containing approximately 300-500 million alveoli providing about 70 m² of surface area for gas exchange. Each breath takes in about 500 mL of air, and on average we breathe 12-20 times per minute. The diaphragm is the main muscle driving the breathing process.',
        funFact: 'The left lung is 10% smaller than the right — to make room for the heart.',
        videoId: 'yv3W1dGMYpo',
      },
    },
  },
  {
    id: 'stomach',
    name: { he: 'קיבה', en: 'Stomach' },
    latinName: 'Gaster',
    bodySystem: { he: 'מערכת העיכול', en: 'Digestive System' },
    emoji: '🟡',
    position: [-0.1, 0.65, 0.12],
    scale: [0.35, 0.32, 0.28],
    color: '#ffd54f',
    hoverColor: '#ffe082',
    annotations: [
      { id: 'fundus', offset: [0.1, 0.18, 0.08], label: { he: 'קרקעית הקיבה', en: 'Fundus' } },
      { id: 'pylorus', offset: [0.1, -0.18, 0.08], label: { he: 'השוער', en: 'Pylorus' } },
    ],
    kids: {
      he: {
        description: 'הקיבה היא כמו מיקסר חזק בתוך הבטן! כשאנחנו אוכלים, האוכל מגיע לקיבה והיא מערבבת אותו עם נוזלים מיוחדים שמפרקים את האוכל לחלקים קטנים, ככה הגוף יכול להשתמש באוכל כדי לגדול ולהיות חזק!',
        funFact: 'הקיבה מייצרת חומצה חזקה כל כך שהיא יכולה להמיס מתכת! אבל אל דאגה - יש לה שכבת הגנה מיוחדת 🛡️',
        videoId: 'VBJnRIIRnUo',
      },
      en: {
        description: 'The stomach is like a powerful blender in your belly! When you eat, food goes to the stomach and it mixes it with special liquids that break food into tiny pieces, so the body can use it to grow and be strong!',
        funFact: 'The stomach produces acid so strong it can dissolve metal! But don\'t worry — it has a special protective layer 🛡️',
        videoId: 'VBJnRIIRnUo',
      },
    },
    adults: {
      he: {
        description: 'הקיבה היא איבר שרירי בצורת J שנפחה נע בין 50 מ"ל (ריקה) ל-1.5 ליטר (מלאה). היא מפרישה חומצה הידרוכלורית (pH 1.5-3.5), פפסין ומוצין. השכבה הרירית מתחדשת כל 3-4 ימים כדי להגן מפני חומציות עצמית. תהליך העיכול בקיבה נמשך 2-5 שעות.',
        funFact: 'הקיבה לא מעכלת את עצמה בזכות שכבת ריר מגנה שמתחדשת כל 2 שבועות.',
        videoId: 'VBJnRIIRnUo',
      },
      en: {
        description: 'The stomach is a J-shaped muscular organ with a volume ranging from 50 mL (empty) to 1.5 liters (full). It secretes hydrochloric acid (pH 1.5-3.5), pepsin, and mucin. The mucosal layer is renewed every 3-4 days to protect against self-digestion. The digestive process in the stomach takes 2-5 hours.',
        funFact: 'The stomach doesn\'t digest itself thanks to a protective mucus layer that renews every 2 weeks.',
        videoId: 'VBJnRIIRnUo',
      },
    },
  },
  {
    id: 'hands',
    name: { he: 'ידיים', en: 'Hands' },
    latinName: 'Manus',
    bodySystem: { he: 'מערכת השריר-שלד', en: 'Musculoskeletal System' },
    emoji: '🤲',
    position: [0, 0.25, 0.05],
    scale: [1.5, 0.28, 0.22],
    color: '#a1887f',
    hoverColor: '#bcaaa4',
    annotations: [],
    kids: {
      he: {
        description: 'הידיים שלנו הן כלים מדהימים! אנחנו יכולים לצייר, לכתוב, לתפוס כדור, ללטף חתול, ולבנות מגדלים מקוביות. בכל יד יש 27 עצמות קטנות שעובדות ביחד כמו צוות מושלם!',
        funFact: 'אצבעות הידיים כל כך רגישות שהן יכולות להרגיש רטט של 0.02 מילימטר בלבד! ✋',
        videoId: 'yAuOi58oHHc',
      },
      en: {
        description: 'Our hands are amazing tools! We can draw, write, catch a ball, pet a cat, and build towers from blocks. Each hand has 27 tiny bones working together like a perfect team!',
        funFact: 'Fingertips are so sensitive they can detect vibrations of just 0.02 millimeters! ✋',
        videoId: 'yAuOi58oHHc',
      },
    },
    adults: {
      he: {
        description: 'כף היד מכילה 27 עצמות, 29 מפרקים, ולפחות 123 רצועות. השרירים שמניעים את האצבעות נמצאים בעיקר באמה, ופועלים דרך גידים ארוכים. כף היד מכילה כ-17,000 קולטני מגע, מה שהופך אותה לאחד מאיברי החישה המפותחים ביותר.',
        funFact: 'לכף היד של האדם יש את אחוז המגע הגבוה ביותר בגוף ביחס לשטח - כ-2,500 קולטנים לכל סנטימטר מרובע בקצות האצבעות.',
        videoId: 'yAuOi58oHHc',
      },
      en: {
        description: 'The hand contains 27 bones, 29 joints, and at least 123 ligaments. The muscles that move the fingers are mainly in the forearm, operating through long tendons. The hand has about 17,000 touch receptors, making it one of the most developed sensory organs.',
        funFact: 'The human hand has the highest density of touch receptors in the body — about 2,500 receptors per square centimeter at the fingertips.',
        videoId: 'yAuOi58oHHc',
      },
    },
  },
  {
    id: 'legs',
    name: { he: 'רגליים', en: 'Legs' },
    latinName: 'Membrum inferius',
    bodySystem: { he: 'מערכת השריר-שלד', en: 'Musculoskeletal System' },
    emoji: '🦵',
    position: [0, -1.15, 0],
    scale: [0.6, 1.0, 0.3],
    color: '#90a4ae',
    hoverColor: '#b0bec5',
    annotations: [],
    kids: {
      he: {
        description: 'הרגליים הן כמו עמודים חזקים שמחזיקים אותנו ועוזרות לנו ללכת, לרוץ, לקפוץ ולרקוד! עצם הירך ברגל היא העצם הכי ארוכה והכי חזקה בכל הגוף!',
        funFact: 'אדם ממוצע הולך במהלך חייו מרחק שווה ערך ל-4 פעמים הקפת כדור הארץ! 🌍',
        videoId: 'GFUKKo-MPYY',
      },
      en: {
        description: 'Legs are like strong pillars that hold us up and help us walk, run, jump and dance! The thigh bone is the longest and strongest bone in the whole body!',
        funFact: 'An average person walks a distance equal to going around the Earth 4 times in their lifetime! 🌍',
        videoId: 'GFUKKo-MPYY',
      },
    },
    adults: {
      he: {
        description: 'הרגל מורכבת מ-30 עצמות עיקריות, יותר מ-40 שרירים וכ-200 רצועות וגידים. עצם הירך (פמור) היא העצם הארוכה והחזקה בגוף, ויכולה לשאת כוח של עד 30 פעמים ממשקל הגוף בזמן ריצה. הברך הוא המפרק הגדול ביותר בגוף.',
        funFact: 'כף הרגל מכילה 26 עצמות - רבע מכל העצמות בגוף! ביחד, שתי כפות הרגליים מכילות 52 עצמות.',
        videoId: 'GFUKKo-MPYY',
      },
      en: {
        description: 'The leg consists of 30 main bones, more than 40 muscles, and about 200 ligaments and tendons. The femur is the longest and strongest bone in the body, capable of bearing forces up to 30 times body weight during running. The knee is the largest joint in the body.',
        funFact: 'The foot contains 26 bones — a quarter of all bones in the body! Together, both feet contain 52 bones.',
        videoId: 'GFUKKo-MPYY',
      },
    },
  },
];
