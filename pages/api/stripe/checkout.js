import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { packageType, email } = req.body;
    
    
    let unitAmount = 0;
    let credits = 0;

    if (packageType === 'small') {
      unitAmount = 500; 
      credits = 50;
    } else if (packageType === 'medium') {
      unitAmount = 1500; 
      credits = 170;
    } else if (packageType === 'large') {
      unitAmount = 3000; 
      credits = 350;
    } else {
      return res.status(400).json({ error: 'Nepasirinktas teisingas paketas' });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Kreditų paketas (${credits} kreditų)`,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: email,
        success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/checkout/cancel`,
      });

      res.status(200).json({ sessionId: session.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Stripe Checkout Session negalėjo būti sukurtas' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
