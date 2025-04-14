import { useState } from "react";
import { useRouter } from "next/router";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/login");
    } else {
      setError(data.message || "Registracija nepavyko");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h3>Registracija</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formName" className="mb-3">
                  <Form.Label>Vardas</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Įveskite savo vardą"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>El. paštas</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Įveskite el. paštą"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Slaptažodis</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Įveskite slaptažodį"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Registruotis
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
