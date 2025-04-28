import { useState, useEffect }      from 'react';
import { useSession }                from 'next-auth/react';
import { useRouter }                 from 'next/router';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { useCredits }                from '@/contexts/CreditsContext';

export default function ArticlesList() {
  const { data: session, status } = useSession();
  const [articles, setArticles]   = useState([]);
  const [error, setError]         = useState('');
  const { credits, setCredits }   = useCredits();
  const router = useRouter();


  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(setArticles)
      .catch(console.error);
  }, []);

  const handlePurchase = async (id, price) => {
    if (!session) return router.push('/login');
    if (credits < price) return alert('Nėra pakankamai kreditų');

    const res = await fetch(`/api/articles/${id}/purchase`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setCredits(data.remainingCredits);
      router.push(`/articles/${id}`);
    } else {
      setError(data.error || 'Klaida perkant');
    }
  };

  if (status === 'loading') return <p>Loading...</p>;

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        {articles.map(a => (
          <Col md={4} key={a._id} className="mb-4">
            <Card>
              <Card.Img variant="top" src={a.imageUrl} />
              <Card.Body>
                <Card.Title>{a.title}</Card.Title>
                <Card.Text>Kaina: {a.price} kreditų</Card.Text>
                <Button
                  onClick={() => handlePurchase(a._id, a.price)}
                  disabled={credits < a.price}
                >
                  Pirkti
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}