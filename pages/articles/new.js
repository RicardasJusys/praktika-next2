// pages/articles/new.js
import { useState, useEffect } from 'react';
import { useSession }          from 'next-auth/react';
import { useRouter }           from 'next/router';
import {
  Container, Card, Form,
  Button, Alert, Spinner
} from 'react-bootstrap';

export default function NewArticle() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [error, setError] = useState('');
  const [form, setForm]   = useState({
    title:    '',
    body:     '',
    imageUrl: '',   // <-- now holds the Cloudinary URL
    price:     5,
  });
  const [uploading, setUploading] = useState(false);

  // redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // handle selecting a file and uploading to Cloudinary
  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const body = new FormData();
    body.append('file', file);

    const res  = await fetch('/api/upload', { method: 'POST', body });
    const json = await res.json();
    setUploading(false);

    if (res.ok) {
      // set the public URL returned by Cloudinary
      setForm(f => ({ ...f, imageUrl: json.url }));
    } else {
      setError(json.error || 'Klaida siunčiant nuotrauką');
    }
  };

  // handle final form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.imageUrl) {
      setError('Prašome įkelti nuotrauką.');
      return;
    }

    const res  = await fetch('/api/articles', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });
    const json = await res.json();

    if (res.ok) {
      router.push('/articles/' + json._id);
    } else {
      setError(json.error || 'Klaida kuriant straipsnį');
    }
  };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header><h3>Kurti naują straipsnį</h3></Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Title */}
            <Form.Group className="mb-3">
              <Form.Label>Pavadinimas</Form.Label>
              <Form.Control
                type="text"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                required
              />
            </Form.Group>

            {/* Body */}
            <Form.Group className="mb-3">
              <Form.Label>Turinys</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={form.body}
                onChange={e => setForm({...form, body: e.target.value})}
                required
              />
            </Form.Group>

            {/* Image upload */}
            <Form.Group className="mb-3">
              <Form.Label>Nuotrauka</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
              {uploading && <Spinner animation="border" size="sm" className="mt-2" />}
              {form.imageUrl && (
                <div className="mt-2">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    style={{ maxWidth: '200px', borderRadius: '4px', boxShadow: '0 0 6px rgba(0,0,0,0.1)' }}
                  />
                </div>
              )}
            </Form.Group>

            {/* Price */}
            <Form.Group className="mb-3">
              <Form.Label>Kaina (kreditais)</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={form.price}
                onChange={e => setForm({...form, price: +e.target.value})}
                required
              />
            </Form.Group>

            <Button type="submit">Sukurti straipsnį</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
