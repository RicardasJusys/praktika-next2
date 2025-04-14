import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log("Webhook route hit");


    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.customer_details.email;
      const amountPaid = session.amount_total;

      let creditsPurchased = 0;
      if (amountPaid === 500) creditsPurchased = 50;
      else if (amountPaid === 1500) creditsPurchased = 170;
      else if (amountPaid === 3000) creditsPurchased = 350;

      await dbConnect();

      await User.findOneAndUpdate(
        { email: userEmail },
        { $inc: { credits: creditsPurchased } },
        { new: true }
      );

      console.log(`Credits updated for ${userEmail}`);
    }

    res.status(200).send('Webhook received');
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
