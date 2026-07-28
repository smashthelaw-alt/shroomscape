/**
 * Site-wide copy.
 *
 * Voice notes, because they were an explicit ask and they are easy to drift from:
 * short real sentences, no em-dashes, no "we are passionate about" filler, and
 * Bangla that reads like a person wrote it rather than a translation of the
 * English line above it.
 *
 * The brand is positioned as a curated source for fresh and wellness mushrooms.
 * It does not claim to grow anything in house.
 */

export const site = {
  name: 'Shroomscape',
  tagline: 'Nature, Nourish and Nurture.',
  taglineBn: 'স্বাদে মজাদার, উপকারে অসাধারণ',

  heroEyebrow: 'ঢাকায় ডেলিভারি · Fresh & wellness mushrooms',
  heroLine1: 'Good mushrooms,',
  heroLine2: 'picked for you.',
  heroLead:
    'We bring together fresh mushrooms and wellness varieties from growers we trust, and deliver them across Dhaka. Tell us what you need and we will sort it out.',
  heroLeadBn: 'তাজা মাশরুম আর ওয়েলনেস ভ্যারাইটি, ঢাকার ভেতরে পৌঁছে দিই।',

  ctaPrimary: 'অর্ডার করুন',
  ctaPrimaryEn: 'Order now',
  ctaSecondary: 'See all varieties',
  ctaPrice: 'দাম জানতে যোগাযোগ করুন',
  ctaPriceEn: 'Ask for a price',

  phone: '+880 1746-011951',
  phoneHref: '+8801746011951',
  bkash: '01843736267',
  email: 'shroomscapebd@gmail.com',
  address: 'Mirpur-14, Kafrul, Dhaka 1206',
  facebook: 'https://www.facebook.com/shroomscapeBangladesh',
  facebookHandle: '@shroomscapeBangladesh',

  /** Shown on the catalogue. This is a shop, not a foraging guide. */
  safetyNote:
    'Everything listed here is a known edible mushroom or one traditionally brewed as a drink. This is a catalogue of what we can source, not a guide to picking mushrooms yourself. Please never eat a wild mushroom you have not bought from a trusted seller.',

  claimsNote:
    'Mushrooms are food, not medicine. We talk about nutrition and cooking, and we do not claim that anything here prevents or treats illness.',
};

export const nav = [
  { href: '/', label: 'Home', bn: 'হোম' },
  { href: '/varieties', label: 'Varieties', bn: 'জাত' },
  { href: '/recipes', label: 'Recipes', bn: 'রেসিপি' },
  { href: '/price', label: 'Price', bn: 'দাম' },
  { href: '/blog', label: 'Blog', bn: 'ব্লগ' },
  { href: '/contact', label: 'Contact', bn: 'যোগাযোগ' },
];

export const promises = [
  {
    title: 'Picked, not guessed',
    bn: 'বেছে নেওয়া',
    body: 'We buy from growers we have actually visited and we check every batch before it goes out.',
  },
  {
    title: 'Delivered across Dhaka',
    bn: 'ঢাকায় ডেলিভারি',
    body: 'Kept cool on the way to you. Message us in the morning and most areas get it the same day.',
  },
  {
    title: 'We show you how to cook it',
    bn: 'রান্নাও শিখিয়ে দিই',
    body: 'A new recipe every Thursday, written in Bangla, free whether you buy from us or not.',
  },
];
