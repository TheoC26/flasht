// app/api/create-portal-session/route.ts
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new Response('Unauthorized', { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return new Response('No Stripe customer ID found for this user.', { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal session creation error:", error);
    return new Response("Error creating portal session", { status: 500 });
  }
}
