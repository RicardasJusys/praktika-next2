// pages/articles/index.js
import { useState, useEffect } from 'react';
import { useSession }           from 'next-auth/react';
import { useRouter }            from 'next/router';
import Link                     from 'next/link';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';

export default function ArticlesList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(setArticles)
      .catch(() => setError('Nepavyko gauti straipsnių.'));
  }, []);

  const handlePurchase = async (id) => {
    if (!session) return router.push('/login');
    const res = await fetch(`/api/articles/${id}/purchase`, { method: 'POST' });
    if (res.ok) {
      router.push(`/articles/${id}`);
    } else {
      const json = await res.json();
      alert(json.error || 'Pirkimas nepavyko.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Ar tikrai norite ištrinti šį straipsnį?')) return;
    const res = await fetch(`/api/articles/${id}/delete`, { method: 'DELETE' });
    if (res.ok) {
      setArticles(a => a.filter(x => x._id !== id));
    } else {
      alert('Trūksta teisių arba įvyko klaida.');
    }
  };

  if (status === 'loading') return <p>Įkraunama…</p>;

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        {articles.map(article => {
          const isAuthor = session?.user?.id === article.author;
          return (
            <Col md={4} key={article._id} className="mb-4">
              <Card>
                <Card.Img variant="top" src={article.imageUrl} />
                <Card.Body>
                  <Card.Title>{article.title}</Card.Title>
                  <Card.Text>Kaina: {article.price} kreditų</Card.Text>

                  {isAuthor ? (
                    <>
                      <Link href={`/articles/${article._id}`} passHref legacyBehavior>
                        <Button variant="info" className="me-2">
                          Peržiūrėti
                        </Button>
                      </Link>
                      <Button variant="danger" onClick={() => handleDelete(article._id)}>
                        Ištrinti
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => handlePurchase(article._id)}>
                      Pirkti
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}
