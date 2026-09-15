Import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { env } from "@/env.mjs";

export async function POST(req: Request) {
  Try {
    Const session = await auth();

    If (!session || !session.user) {
      Return new NextResponse("Unauthorized", { status: 401 });
    }

    Const body = await req.json();
    Const { priceId } = body;

    Const stripeSession = await stripe.checkout.sessions.create({
      Success_url: `${env.NEXTAUTH_URL}/dashboard?success=true`,
      Cancel_url: `${env.NEXTAUTH_URL}/pricing?canceled=true`,
      Payment_method_types: ["card"],
      Mode: "subscription",
      Customer_email: session.user.email ?? undefined,
      Line_items: [
        {
          Price: priceId,
          Quantity: 1,
        },
      ],
      Metadata: {
        UserId: session.user.id,
      },
    });

    Return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    Console.error("[STRIPE_ERROR]", error);
    Return new NextResponse("Internal Error", { status: 500 });
  }
}
