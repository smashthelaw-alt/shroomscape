export type Availability = 'stocked' | 'seasonal' | 'order';

export interface Variety {
  slug: string;
  en: string;
  bn: string;
  latin: string;
  /** 'fresh' = culinary produce, 'wellness' = brewed or taken as a supplement */
  group: 'fresh' | 'gourmet' | 'wellness';
  availability: Availability;
  /** one warm line for the catalogue card */
  blurb: string;
  /** what it tastes and feels like to cook with */
  culinary: string;
  origin: string;
  history: string;
  /** Bangla benefit lines. Nutrition and culinary properties only. */
  benefits: string[];
  chips: string[];
  /** true when the photo comes from the client's own library */
  ownPhoto?: boolean;
}

export interface Recipe {
  slug: string;
  titleBn: string;
  titleEn: string;
  lead: string;
  minutes: number;
  serves: number;
  uses: string;
  image: string;
  ingredients: { item: string; qty: string; note?: string }[];
  steps: string[];
  tip?: string;
}

export interface Post {
  slug: string;
  title: string;
  titleBn?: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  image: string;
  body: string[];
}
