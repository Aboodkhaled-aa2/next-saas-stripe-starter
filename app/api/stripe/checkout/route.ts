import { NextResponse } from "next/server";
// تعديل مسار الجلسة بناءً على مكان ملف الauth الحقيقي في مشروعك
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/server/auth"; // أو المسار الصحيح للـ auth حسب باقي ملفات الـ api عندك
import { stripe } from "@/lib/stripe"; // تأكد من مسار الـ stripe لديك
import { env } from "@/env.mjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { priceId } = body;

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${env.NEXTAUTH_URL}/pricing?canceled=true`,
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
