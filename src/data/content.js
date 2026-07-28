/**
 * All site copy, bilingual.
 *
 * Sourced from the Shroomscape Brand Guidelines v1.0 (July 2026) messaging
 * library and from the brand's own published social creative. Two edits were
 * made deliberately against the source creative, to comply with the hard line
 * on p.19 ("we may never claim that any Shroomscape product prevents, treats
 * or cures a disease"):
 *   - the Milky mushroom card's "ক্যান্সার প্রতিরোধে গুণসম্পন্ন" claim is dropped
 *   - the Wood Ear card's diabetes line is softened to the approved
 *     "diabetic-friendly diet" phrasing
 */

export const brand = {
  name: 'Shroomscape',
  tagline: 'Nature, Nourish and Nurture.',
  taglineBn: 'স্বাদে মজাদার, উপকারে অসাধারণ',
  oneLine: 'Fresh mushrooms, grown near you, cooked in ways you already love.',
  phone: '+880 1746-011951',
  phoneHref: '+8801746011951',
  email: 'shroomscapebd@gmail.com',
  handle: '@shroomscapebd',
  facebook: 'https://www.facebook.com/shroomscapeBangladesh',
  address: 'Mirpur-14, Kafrul, Dhaka 1206, Bangladesh',
  addressShort: 'Mirpur-14, Kafrul, Dhaka 1206',
};

export const nav = [
  { id: 'values', en: 'Ethos', bn: 'নীতি' },
  { id: 'varieties', en: 'Varieties', bn: 'জাত' },
  { id: 'compare', en: 'Compare', bn: 'তুলনা' },
  { id: 'farm', en: 'The Farm', bn: 'খামার' },
  { id: 'recipe', en: 'Thursdays', bn: 'বৃহস্পতিবার' },
  { id: 'trade', en: 'Wholesale', bn: 'পাইকারি' },
];

export const values = [
  {
    n: '01',
    en: 'Nature',
    bn: 'নেচার',
    lede: 'We grow, we don’t manufacture.',
    body: 'Clean substrate, no shortcuts, minimal processing, honest labels. Every pack is traceable to our own grow rooms in Mirpur-14.',
    test: 'Could a customer visit the farm tomorrow and see exactly what we’ve claimed?',
    plate: '/assets/tiles/oyster.webp',
    alt: 'Oyster mushrooms grown at the Shroomscape farm',
  },
  {
    n: '02',
    en: 'Nourish',
    bn: 'নারিশ',
    lede: 'Nutrition is the reason to buy.',
    body: 'We lead with real benefits — zero cholesterol, high fibre, low fat, suitable for diabetic-friendly diets. No miracle-cure language, ever.',
    test: 'Is every health claim something we can source and defend?',
    plate: '/assets/food/creamy.webp',
    alt: 'A creamy mushroom dish plated at home',
  },
  {
    n: '03',
    en: 'Nurture',
    bn: 'নার্চার',
    lede: 'We teach as much as we sell.',
    body: 'Recipes, storage tips, cooking help. A weekly recipe every Thursday, in Bangla, whether or not you ever buy from us.',
    test: 'Does this post help someone even if they never buy from us?',
    plate: '/assets/food/plated.webp',
    alt: 'Sautéed oyster mushrooms served on a white plate',
  },
];

export const varieties = [
  {
    id: 'oyster',
    en: 'Oyster',
    bn: 'ওয়েস্টার মাশরুম',
    latin: 'Pleurotus ostreatus',
    core: true,
    note: 'The house variety. Cooks in under five minutes and takes on whatever you cook it with.',
    benefits: [
      'শরীরের কোষকে সুরক্ষা দেয়',
      'রক্তচাপ নিয়ন্ত্রণে সহায়তা করে',
      'পাচনতন্ত্রের সুস্থতা বজায় রাখে',
    ],
    chips: ['ZERO CHOLESTEROL', 'HIGH FIBRE', 'VITAMIN B3'],
  },
  {
    id: 'button',
    en: 'Button',
    bn: 'বাটন মাশরুম',
    latin: 'Agaricus bisporus',
    core: true,
    note: 'The familiar one. Best first mushroom for a kitchen that has never cooked them.',
    benefits: [
      'শরীরের কোষকে সুরক্ষা দেয়',
      'হরমোন উৎপাদনে ভূমিকা রাখে',
      'শরীরের বিপাক ক্রিয়া বাড়ায়',
    ],
    chips: ['LOW FAT', 'POTASSIUM', 'RIBOFLAVIN'],
  },
  {
    id: 'enoki',
    en: 'Enoki',
    bn: 'এনোকি মাশরুম',
    latin: 'Flammulina filiformis',
    core: true,
    note: 'Long, fine and crisp. Goes into soup, noodles and hot pot in the last thirty seconds.',
    benefits: [
      'শরীরের কোষকে সুরক্ষা দেয়',
      'রক্তচাপ নিয়ন্ত্রণে সহায়তা করে',
      'পাচনতন্ত্রের সুস্থতা বজায় রাখে',
    ],
    chips: ['HIGH FIBRE', 'LOW-CALORIE', 'B VITAMINS'],
  },
  {
    id: 'shiitake',
    en: 'Shiitake',
    bn: 'শিটাকি মাশরুম',
    latin: 'Lentinula edodes',
    note: 'Deep, savoury, almost meaty. The one that converts people who say they dislike mushrooms.',
    benefits: [
      'ত্বককে সুস্থ ও সতেজ রাখে',
      'স্নায়ুতন্ত্রের কার্যকারিতা বজায় রাখে',
      'শরীরের খনিজ ভারসাম্য রক্ষায় ভূমিকা রাখে',
    ],
    chips: ['BETA-GLUCANS', 'NIACIN', 'PANTOTHENIC ACID'],
  },
  {
    id: 'lionsmane',
    en: 'Lion’s Mane',
    bn: 'লায়ন্স মেন মাশরুম',
    latin: 'Hericium erinaceus',
    note: 'Shaggy and white. Pulls apart into strands and pan-fries like a fillet.',
    benefits: [
      'মস্তিষ্কের কার্যক্ষমতা বাড়ায়',
      'ঘুমের গুণগত মান উন্নত করে',
      'স্ট্রেস ও অবসাদ কমাতে সহায়ক',
    ],
    chips: ['LOW FAT', 'HIGH FIBRE', 'ZERO CHOLESTEROL'],
  },
  {
    id: 'reishi',
    en: 'Ganoderma · Reishi',
    bn: 'গ্যানোডার্মা / রেইশি',
    latin: 'Ganoderma lucidum',
    note: 'Woody and bitter — brewed, not fried. Steeped as a tea rather than served on a plate.',
    benefits: [
      'রোগ প্রতিরোধ ক্ষমতা শক্তিশালী করে',
      'রক্ত চলাচল উন্নত করে',
      'অ্যান্টিঅক্সিডেন্টে ভরপুর',
    ],
    chips: ['ANTIOXIDANT', 'ZERO FAT', 'BREW ONLY'],
  },
  {
    id: 'milky',
    en: 'Milky',
    bn: 'মিল্কি মাশরুম',
    latin: 'Calocybe indica',
    note: 'Grown for our climate — it holds up to Dhaka heat better than almost anything else.',
    benefits: [
      'ওজন নিয়ন্ত্রণে সহায়ক',
      'হৃদপিণ্ডের স্বাস্থ্যের জন্য ভালো',
      'রক্তে শর্করা নিয়ন্ত্রণে সাহায্য করে',
    ],
    chips: ['SELENIUM', 'VITAMIN D', 'LOW-CALORIE'],
  },
  {
    id: 'woodear',
    en: 'Wood Ear',
    bn: 'উড ইয়ার / ব্ল্যাক',
    latin: 'Auricularia auricula-judae',
    note: 'All texture, little flavour. Rehydrates into something with real bite.',
    benefits: [
      'রক্তনালী নরম ও নমনীয় রাখে',
      'কোষ্ঠকাঠিন্য দূর করে',
      'ডায়াবেটিক-ফ্রেন্ডলি খাদ্যতালিকার জন্য উপযোগী',
    ],
    chips: ['HIGH FIBRE', 'IRON', 'ZERO CHOLESTEROL'],
  },
];

/** The brand's highest-performing social format, reproduced as an interactive grid. */
export const comparison = [
  { good: 'Zero cholesterol', bad: 'High cholesterol' },
  { good: 'High fibre', bad: 'Zero fibre' },
  { good: 'Low fat', bad: 'High fat' },
  { good: 'Low calorie', bad: 'High calorie' },
  { good: 'Diabetic friendly', bad: 'High glycemic' },
  { good: 'Vitamin rich', bad: 'Limited vitamins' },
  { good: 'High in minerals', bad: 'Low in minerals' },
  { good: 'Easy to digest', bad: 'Heavy on the stomach' },
];

export const stats = [
  { value: 0, suffix: 'mg', label: 'Cholesterol', sub: 'per 100 g fresh weight', bn: 'কোলেস্টেরল' },
  { value: 3, suffix: '', label: 'Core varieties', sub: 'Oyster · Button · Enoki', bn: 'জাত' },
  { value: 3.9, suffix: 'K', label: 'Community', sub: 'on Facebook', bn: 'কমিউনিটি' },
  { value: 5, suffix: 'min', label: 'Cook time', sub: 'oyster, sliced and seared', bn: 'রান্নার সময়' },
];

export const recipe = {
  eyebrow: 'WEEKLY RECIPE · THURSDAY',
  titleBn: 'ঘরে বসেই বানিয়ে ফেলুন',
  titleBn2: 'সটেড ওয়েস্টার মাশরুম',
  titleEn: 'Sautéed Oyster Mushrooms',
  lede: 'স্বাদে মজাদার, উপকারে অসাধারণ। জিরো কোলেস্টেরল, উচ্চ ফাইবার, দশ মিনিটে তৈরি।',
  ledeEn: 'Zero cholesterol, high fibre, ready in ten minutes. Every Thursday, a new one.',
  ingredients: [
    { bn: 'মাশরুম', qty: '৫০০ গ্রাম', note: 'স্লাইস করা' },
    { bn: 'মাখন / তেল', qty: '২–৩ টেবিল চামচ', note: '' },
    { bn: 'রসুন কুচি', qty: '১–২ কোয়া', note: '' },
    { bn: 'লবণ', qty: 'স্বাদমতো', note: '' },
  ],
  steps: [
    'একটি প্যান অথবা কড়াই মাঝারি আঁচে গরম করে নিন।',
    'মাখন বা তেল দিয়ে রসুন কুচি হালকা বাদামি হওয়া পর্যন্ত ভাজুন।',
    'স্লাইস করা মাশরুম দিয়ে উঁচু আঁচে নাড়তে থাকুন — পানি শুকিয়ে না আসা পর্যন্ত।',
    'লবণ ছড়িয়ে নামিয়ে ফেলুন। সেসিমি সিড ও লেবুর রস দিয়ে গরম গরম পরিবেশন করুন।',
  ],
};

export const tradePoints = [
  { k: 'Consistent supply', v: 'Weekly volume committed in advance, not sold on a first-come basis.' },
  { k: 'Graded weekly', v: 'Sorted by cap size and firmness before it leaves the grow room.' },
  { k: 'Dhaka delivery', v: 'Cold-chain handled to your kitchen door across the metro.' },
  { k: 'One source', v: 'Our own grow rooms — no aggregation from anonymous market produce.' },
];
