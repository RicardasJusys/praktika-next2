import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';
import { useCredits } from '@/contexts/CreditsContext';

export default function SlotMachineGame() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setCredits } = useCredits();           // ← grab setter

  const [bet, setBet] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
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
      setCredits(data.updatedCredits);  // ← update context immediately
    } else {
      setError(data.error || 'An error occurred.');
    }
  };

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header><h3>Lošimo automatas</h3></Card.Header>
        <Card.Body>
        <div style={{ marginBottom: '20px' }}>
            <h5 style={{ textAlign: 'center' }}>Laimėjimų taisyklės</h5>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'flex',
                  gap: '5px',
                  justifyContent: 'center'
                }}>
                  <img src="/slots/cherry.png" alt="Cherry" style={{ width: '60px', height: '60px' }} />
                  <img src="/slots/lemon.png" alt="Lemon" style={{ width: '60px', height: '60px' }} />
                  <img src="/slots/watermelon.png" alt="Watermelon" style={{ width: '60px', height: '60px' }} />
                </div>
                <p>
                  Trys vaisiai <span style={{ color: 'red', fontWeight: 'bold' }}>2x</span>
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'flex',
                  gap: '5px',
                  justifyContent: 'center'
                }}>
                  <img src="/slots/cherry.png" alt="Cherry" style={{ width: '60px', height: '60px' }} />
                  <img src="/slots/cherry.png" alt="Cherry" style={{ width: '60px', height: '60px' }} />
                  <img src="/slots/cherry.png" alt="Cherry" style={{ width: '60px', height: '60px' }} />
                </div>
                <p>
                  Trys vienodi vaisiai <span style={{ color: 'red', fontWeight: 'bold' }}>10x</span>
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'flex',
                  gap: '5px',
                  justifyContent: 'center'
                }}>
                  <img src="/slots/bell.png" alt="Bell" style={{ width: '60px', height: '60px' }} />
                  <img src="/slots/bell.png" alt="Bell" style={{ width: '60px', height: '60px' }} />
                  <img src="/slots/bell.png" alt="Bell" style={{ width: '60px', height: '60px' }} />
                </div>
                <p>
                  Trys varpai <span style={{ color: 'red', fontWeight: 'bold' }}>25x</span>
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'flex',
                  gap: '5px',
                  justifyContent: 'center'
                }}>
                  <img src="/slots/seven.png" alt="Seven" style={{ width: '60px', height: '60px' }} />
                  <img src="/slots/seven.png" alt="Seven" style={{ width: '60px', height: '60px' }} />
                  <img src="/slots/seven.png" alt="Seven" style={{ width: '60px', height: '60px' }} />
                </div>
                <p>
                  Trys septynetai <span style={{ color: 'red', fontWeight: 'bold' }}>100x</span>
                </p>
              </div>
            </div>
          </div>

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
            <div className="mt-3" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px'
            }}>
              {result.reels.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Reel ${i + 1}`}
                  style={{ width: '120px', height: '120px' }}
                />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
