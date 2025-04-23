import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router';
import { Container, Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';

export default function CoinFlipGame() {
  // Pull in refetch along with session data & status
  const { data: session, status, refetch } = useSession();
  const router = useRouter();

  const [bet, setBet] = useState('');
  const [choice, setChoice] = useState('skaicius');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const playGame = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const parsedBet = parseInt(bet, 10);
    if (!parsedBet || parsedBet <= 0) {
      setError("Please enter a valid bet amount.");
      setLoading(false);
      return;
    }

    const res = await fetch('/api/games/coinflip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet: parsedBet, choice }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setResult(data);
      // Fallback: refresh the NextAuth session so navbar credits update
      await signIn(undefined, { redirect: false });
    } else {
      setError(data.error || "An error occurred.");
    }
  };

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h3>Monetos Metimo Žaidimas</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {result && (
            <Alert variant={result.win ? "success" : "warning"}>
              {result.win ? "🎉 Laimėjote!" : "😢 Pralaimėjote..."}
              <br />
              Atnaujinti kreditai: <strong>{result.updatedCredits}</strong>
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Įveskite statymo sumą</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                placeholder="pvz. 10"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Pasirinkite rezultatą</Form.Label>
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
                    value="skaicius"
                    checked={choice === "skaicius"}
                    onChange={() => setChoice("skaicius")}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Button onClick={playGame} disabled={loading}>
              {loading ? "Metama..." : "Mesti"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
