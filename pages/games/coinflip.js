import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { Container, Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CoinFlipGame() {
  const { data: session, status } = useSession();
  const router = useRouter();

  
  const [bet, setBet] = useState('');
  const [choice, setChoice] = useState('herbas');  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  if (status === "unauthenticated") {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  const playGame = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const parsedBet = parseInt(bet);
    if (!parsedBet || parsedBet <= 0) {
      setError("Įveskite galiojančią kreditų sumą.");
      setLoading(false);
      return;
    }


    const res = await fetch('/api/games/coinflip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bet: parsedBet,
        choice, 
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setResult(data);
      
      setTimeout(() => {
        router.reload();
      }, 2000);
    } else {
      setError(data.error || "Įvyko klaida.");
    }
  };

  if (status === "loading")
    return <p style={{ padding: "2rem" }}>Kraunasi...</p>;

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h3>🪙 Monetos metimas</h3>
        </Card.Header>
        <Card.Body>
          <p>
            <strong>Turimi kreditai:</strong> {session?.user?.credits}
          </p>

          {error && <Alert variant="danger">{error}</Alert>}
          {result && (
            <Alert variant={result.win ? "success" : "warning"}>
              {result.win ? "🎉 Laimėjai!" : "😢 Pralaimėjai!"} Rezultatas:{" "}
              <strong>{result.flip}</strong>
              <br />
              Dabartiniai kreditai: <strong>{result.updatedCredits}</strong>
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Įveskite kreditų sumą</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                placeholder="Pvz. 10"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Pasirink pusę</Form.Label>
              <Row>
                <Col>
                  <Form.Check
                    type="radio"
                    label="Herbas"
                    name="choice"
                    value="herbas"
                    checked={choice === "herbas"}
                    onChange={() => setChoice("herbas")}
                  />
                </Col>
                <Col>
                  <Form.Check
                    type="radio"
                    label="Skaičius"
                    name="choice"
                    value="skaičius"
                    checked={choice === "skaičius"}
                    onChange={() => setChoice("skaičius")}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Button onClick={playGame} disabled={loading}>
              {loading ? "Metama..." : "Mesti monetą"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
