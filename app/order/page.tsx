import type { Metadata } from 'next';
import OrderForm from './OrderForm';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Order',
  description: 'Send us your mushroom list and we will come back with a price and a delivery time.',
};

export default function OrderPage() {
  return (
    <div className="section wrap">
      <header className="sec-head">
        <p className="eyebrow">{site.ctaPrimary} · Order</p>
        <h2>Send us your list.</h2>
        <p>
          Tell us what you want and where you are. We will message you back with a price and a
          delivery time, usually within a few hours.
        </p>
      </header>
      <OrderForm />
    </div>
  );
}
