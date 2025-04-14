import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Container, Card } from "react-bootstrap";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  if (status === "loading") return <p style={{ padding: "2rem" }}>Kraunasi...</p>;

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h3>Vartotojo Profilis</h3>
        </Card.Header>
        <Card.Body>
          <p><strong>Vardas:</strong> {session.user.name}</p>
          <p><strong>El. paštas:</strong> {session.user.email}</p>
          <p><strong>Rolė:</strong> {session.user.role}</p>
          <p><strong>Kreditai:</strong> {session.user.credits}</p>
        </Card.Body>
      </Card>
    </Container>
  );
}
