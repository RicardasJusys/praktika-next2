import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Credits() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedPackage, setSelectedPackage] = useState('small');
  const [loading, setLoading] = useState(false);

  // Redirect if user is not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status]);

  const handleBuyCredits = async () => {
    if (!session?.user?.email) {
      alert("Prašome prisijungti, kad galėtumėte pirkti kreditus.");
      return;
    }

    setLoading(true);

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageType: selectedPackage,
        email: session.user.email,
      }),
    });

    const data = await res.json();
    if (data.sessionId) {
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        console.error('Stripe redirection error:', error);
        setLoading(false);
      }
    } else {
      console.error('Error creating checkout session:', data.error);
      setLoading(false);
    }
  };

  // Optionally show loading while checking session
  if (status === 'loading') return <p style={{ padding: '2rem' }}>Kraunasi...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Pirkti kreditus</h1>
      <div>
        <label>
          <input
            type="radio"
            value="small"
            checked={selectedPackage === 'small'}
            onChange={(e) => setSelectedPackage(e.target.value)}
          />
          5 € – 50 kreditų
        </label>
        <br />
        <label>
          <input
            type="radio"
            value="medium"
            checked={selectedPackage === 'medium'}
            onChange={(e) => setSelectedPackage(e.target.value)}
          />
          15 € – 170 kreditų
        </label>
        <br />
        <label>
          <input
            type="radio"
            value="large"
            checked={selectedPackage === 'large'}
            onChange={(e) => setSelectedPackage(e.target.value)}
          />
          30 € – 350 kreditų
        </label>
      </div>
      <br />
      <button onClick={handleBuyCredits} disabled={loading}>
        {loading ? 'Kraunasi...' : 'Pirkti'}
      </button>
    </div>
  );
}
