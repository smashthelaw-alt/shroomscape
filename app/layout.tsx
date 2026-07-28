import type { Metadata } from 'next';
import { Montserrat, Inter, Noto_Sans_Bengali } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import StickyCta from '@/components/StickyCta';
import { CartProvider } from '@/lib/cart';
import { site } from '@/content/site';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/app.css';

const display = Montserrat({
  subsets: ['latin'], weight: ['700', '800', '900'], variable: '--f-display', display: 'swap',
});
const body = Inter({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--f-body', display: 'swap',
});
const bangla = Noto_Sans_Bengali({
  subsets: ['bengali'], weight: ['400', '500', '600', '700'], variable: '--f-bangla', display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://shroomscape.vercel.app'),
  title: {
    default: 'Shroomscape — fresh and wellness mushrooms in Dhaka',
    template: '%s · Shroomscape',
  },
  description:
    'Fresh mushrooms and wellness varieties, delivered across Dhaka. Browse the catalogue, send us your list, and we will come back with a price.',
  openGraph: {
    type: 'website',
    title: 'Shroomscape — fresh and wellness mushrooms in Dhaka',
    description: 'Fresh mushrooms and wellness varieties, delivered across Dhaka.',
    images: ['/assets/food/creamy.webp'],
    locale: 'en_GB',
    alternateLocale: 'bn_BD',
  },
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
};

export const viewport = { themeColor: '#0a0a0a' };

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.name,
  description: 'Supplier of fresh and wellness mushrooms in Dhaka, Bangladesh.',
  slogan: site.tagline,
  telephone: site.phoneHref,
  email: site.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Mirpur-14, Kafrul',
    addressLocality: 'Dhaka',
    postalCode: '1206',
    addressCountry: 'BD',
  },
  sameAs: [site.facebook],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${bangla.variable}`}>
      {/* browser extensions (Grammarly and friends) add attributes to body
          before React hydrates, which is not a mismatch we can or should fix */}
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a className="skip-link" href="#main">Skip to content</a>
        <CartProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <StickyCta />
        </CartProvider>
      </body>
    </html>
  );
}
