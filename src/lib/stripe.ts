import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Helper to format amount for Stripe (convert to smallest currency unit)
// PKR doesn't have decimal places, so we pass as-is
export function formatAmountForStripe(amount: number, currency: string = 'pkr'): number {
  const currenciesWithoutDecimals = ['pkr', 'jpy', 'krw', 'vnd'];
  
  if (currenciesWithoutDecimals.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }
  
  // For currencies with decimals (like USD), multiply by 100
  return Math.round(amount * 100);
}

// Helper to format amount from Stripe
export function formatAmountFromStripe(amount: number, currency: string = 'pkr'): number {
  const currenciesWithoutDecimals = ['pkr', 'jpy', 'krw', 'vnd'];
  
  if (currenciesWithoutDecimals.includes(currency.toLowerCase())) {
    return amount;
  }
  
  return amount / 100;
}
