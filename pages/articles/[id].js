// pages/articles/[id].js
import { useSession }       from 'next-auth/react';
import { getServerSession }  from 'next-auth/next';
import { authOptions }      from '../api/auth/[...nextauth]';
import dbConnect            from '@/lib/dbConnect';
import Article              from '@/models/Article';
import { Container, Card, Alert } from 'react-bootstrap';

export default function ArticlePage({ article, allowed }) {
  const { data: session } = useSession();

  if (!article) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Straipsnis nerastas.</Alert>
      </Container>
    );
  }

  if (!allowed) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Neturite prieigos šiam straipsniui.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h2>{article.title}</h2>
        </Card.Header>

        {article.imageUrl && (
  <img src={article.imageUrl} alt={article.title} style={{ maxWidth: '100%' }} />
)}


        <Card.Body>
          <div
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </Card.Body>
      </Card>
    </Container>
  );
}

export async function getServerSideProps({ req, res, params }) {
  // Get the logged-in session
  const session = await getServerSession(req, res, authOptions);

  // Connect to MongoDB and fetch the article
  await dbConnect();
  const art = await Article.findById(params.id).lean();
  if (!art) {
    return { notFound: true };
  }

  // Determine if the user is author or a buyer
  const userId   = session?.user?.id;
  const isAuthor = art.author.toString() === userId;
  const isBuyer  = art.buyers.map(b => b.toString()).includes(userId);
  const allowed  = Boolean(userId && (isAuthor || isBuyer));

  return {
    props: {
      article: {
        ...art,
        _id:       art._id.toString(),
        author:    art.author.toString(),
        buyers:    art.buyers.map(b => b.toString()),
        createdAt: art.createdAt.toISOString(),
        updatedAt: art.updatedAt.toISOString(),
      },
      allowed,
    }
  };
}
