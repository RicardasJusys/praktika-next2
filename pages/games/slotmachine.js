import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';

export default function SlotMachineGame() {
  const { data: session, status, refetch } = useSession(); 
  const router = useRouter();

  const [bet, setBet] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const res = await fetch('/api/games/slotmachine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet: parsedBet })
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setResult(data);
      // re-fetch the NextAuth session so navbar credits update
      if (typeof refetch === 'function') await refetch();
    } else {
      setError(data.error || "An error occurred.");
    }
  };

  if (status === "loading") return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header><h3>Lošimo automatas</h3></Card.Header>
        <Card.Body>
          <p><strong>Current Credits:</strong> {session?.user?.credits}</p>

          {/* … payout rules omitted for brevity … */}

          {error && <Alert variant="danger">{error}</Alert>}
          {result && (
            <Alert variant={result.win ? "success" : "warning"}>
              {result.win ? "🎉 Laimėjote!" : "😢 Pralaimėjote!"}<br/>
              Atnaujinti kreditai: <strong>{result.updatedCredits}</strong>
            </Alert>
          )}

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

          <Button onClick={playGame} disabled={loading}>
            {loading ? "Sukama..." : "Sukti"}
          </Button>

          {result?.reels && (
            <div className="mt-3" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {result.reels.map((img, i) => (
                <img key={i} src={img} alt={`Reel ${i+1}`} style={{ width: '120px', height: '120px' }} />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
