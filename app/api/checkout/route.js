import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

export async function POST(req) {
  const cookieStore = cookies();
  const { plan } = await req.json(); // "monthly" or "yearly"

  const priceId =
    plan === "yearly"
      ? process.env.STRIPE_PRO_YEARLY_PRICE_ID
      : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;

  const supabase = createClient();

  const { data: { user }, error: getUserError } = await supabase.auth.getUser();

  if (getUserError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error("Error fetching profile:", profileError);
    return new Response("Error fetching profile", { status: 500 });
  }

  let session;
  try {
    if (profile?.stripe_customer_id) {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: profile.stripe_customer_id,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/home?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
      });
    } else {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/home?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
        client_reference_id: user.id,
        subscription_data: {
          metadata: {
            user_id: user.id,
          },
        },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Stripe session creation error:", err);
    return new Response("Error creating checkout session", { status: 500 });
  }
}

