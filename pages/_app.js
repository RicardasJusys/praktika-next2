import 'bootstrap/dist/css/bootstrap.min.css';
import Head from 'next/head';
import Link from 'next/link';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

function AppNavbar() {
  const { data: session } = useSession();

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Link href="/" passHref legacyBehavior>
          <Navbar.Brand>Pagrindinis</Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">

          <Nav className="me-auto">
            <Link href="/credits" passHref legacyBehavior>
              <Nav.Link>Pirkti Kreditu</Nav.Link>
            </Link>
            <NavDropdown title="Žaidimai" id="games-dropdown">
              <Link href="/games/coinflip" passHref legacyBehavior>
                <NavDropdown.Item>Monetos Metimas</NavDropdown.Item>
              </Link>
              
            </NavDropdown>
          </Nav>


          <Nav className="ms-auto">
            {!session && (
              <>
                <Link href="/login" passHref legacyBehavior>
                  <Nav.Link>Prisijungti</Nav.Link>
                </Link>
                <Link href="/register" passHref legacyBehavior>
                  <Nav.Link>Registruotis</Nav.Link>
                </Link>
              </>
            )}
            {session && (
              <>
                <Navbar.Text className="me-3">
                  Kreditai: <span className="fw-bold">{session.user.credits || 0}</span>
                </Navbar.Text>
                <NavDropdown title={session.user.name || "Profilis"} id="profile-dropdown">
                  <Link href="/profile" passHref legacyBehavior>
                    <NavDropdown.Item>Profilis</NavDropdown.Item>
                  </Link>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => signOut({ callbackUrl: "/" })}>
                    Atsijungti
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Praktika</title>
      </Head>
      <AppNavbar />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
