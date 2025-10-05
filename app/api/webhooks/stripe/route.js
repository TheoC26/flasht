import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// This is the handler for Stripe webhooks.
// It receives events from Stripe and updates the database accordingly.
export async function POST(req) {
  const buf = await req.text();
  const sig = headers().get('stripe-signature');
  const supabase = createClient();

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id || session.subscription_data?.metadata?.user_id;

      if (!userId) {
        console.error('Webhook Error: No user ID found in checkout session');
        break;
      }

      // Update the user's profile with the new Stripe info
      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          is_pro: true,
        })
        .eq('id', userId);

      if (error) {
        console.error('Webhook Error: Failed to update user profile', error);
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find the user with this customer ID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

        if (profileError || !profile) {
            console.error('Webhook Error: Could not find profile for customer', customerId);
            break;
        }

        // Update the is_pro status based on the subscription status
        const newStatus = subscription.status === 'active' || subscription.status === 'trialing';
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_pro: newStatus })
            .eq('id', profile.id);

        if (updateError) {
            console.error('Webhook Error: Failed to update subscription status', updateError);
        }
        break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(null, { status: 200 });
}
