// pages/scrape.js
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter }   from "next/router";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useCredits }   from "@/contexts/CreditsContext";

export default function ScrapePage() {
  const { data: session, status } = useSession();
  const { credits, setCredits }  = useCredits();
  const router = useRouter();

  const [url, setUrl]         = useState("");
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!url) {
      setError("Įveskite URL");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setResult(data);
      setCredits(data.remainingCredits);
    } else {
      setError(data.error || "Klaida");
    }
  };

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header><h3>Web Scraping Paslauga</h3></Card.Header>
        <Card.Body>
          <p>Turimi kreditai: <strong>{credits}</strong></p>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Įveskite norimo puslapio nuorodą</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" disabled={loading || credits < 5}>
              {loading ? "Kraunasi..." : "Scrape (25 kreditai)"}
            </Button>
          </Form>

          {error && <Alert className="mt-3" variant="danger">{error}</Alert>}
          {result && (
            <div className="mt-4">
              <h5>Rezultatas:</h5>
              {result.title && <p><strong>Pavadinimas:</strong> {result.title}</p>}
              {result.image && (
                <div>
                  <strong>Nuotrauka:</strong><br/>
                  <img src={result.image} alt="Scraped" style={{ maxWidth: "100%" }} />
                </div>
              )}
              <p className="mt-2">Liko kreditų: <strong>{result.remainingCredits}</strong></p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
