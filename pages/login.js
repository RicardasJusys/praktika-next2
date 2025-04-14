import { getProviders, signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";

export default function Login({ providers }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setError("");
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/"
    });
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h3>Prisijungimas</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              {providers &&
                Object.values(providers).map((provider) => {
                  if (provider.id === "credentials") return null;
                  return (
                    <div key={provider.name} className="mb-3">
                      <Button
                        variant="outline-primary"
                        className="w-100"
                        onClick={() =>
                          signIn(provider.id, { callbackUrl: "/" })
                        }
                      >
                        Prisijungti su {provider.name}
                      </Button>
                    </div>
                  );
                })}

              <hr />

              <Form onSubmit={handleCredentialsLogin}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>El. paštas</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Įveskite el. paštą"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Slaptažodis</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Įveskite slaptažodį"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Prisijungti
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p>
                  Neturite paskyros?{" "}
                  <Link href="/register" className="text-primary">
                    Sukurti paskyrą
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers }
  };
}
