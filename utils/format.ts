export const formatCurrency = (amount: number | null) => {
  const value = amount || 0;
  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function formatQuantity(quantity: number, noun: string): string {
  return quantity === 1 ? `${quantity} ${noun}` : `${quantity} ${noun}s`;
}

// export const formatDate = (date: Date) => {
//   return new Intl.DateTimeFormat('en-GB', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   }).format(date);
// };

export const formatDate = (date: Date, onlyMonth?: boolean) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
  };

  if (!onlyMonth) {
    options.day = 'numeric';
  }

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

// 'use client';

// import {
//   EmbeddedCheckout,
//   EmbeddedCheckoutProvider,
// } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';

// import { fetchClientSecret } from '../actions/stripe';

// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// );

// export default function Checkout() {
//   return (
//     <div id="checkout">
//       <EmbeddedCheckoutProvider
//         stripe={stripePromise}
//         options={{ fetchClientSecret }}
//       >
//         <EmbeddedCheckout />
//       </EmbeddedCheckoutProvider>
//     </div>
//   );
// }

// 'use server';

// import { headers } from 'next/headers';

// import { stripe } from '../../lib/stripe';

// export async function fetchClientSecret() {
//   const origin = (await headers()).get('origin');

//   // Create Checkout Sessions from body params.
//   const session = await stripe.checkout.sessions.create({
//     ui_mode: 'embedded',
//     line_items: [
//       {
//         // Provide the exact Price ID (for example, price_1234) of
//         // the product you want to sell
//         price: '{{PRICE_ID}}',
//         quantity: 1,
//       },
//     ],
//     mode: 'payment',
//     return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
//   });

//   return session.client_secret;
// }
