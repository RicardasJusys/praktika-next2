import { getServerSession } from 'next-auth/next';
import { authOptions }    from '../auth/[...nextauth]';
import dbConnect           from '@/lib/dbConnect';
import Article             from '@/models/Article';
import User                from '@/models/User';

export default async function handler(req, res) {
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);


  if (req.method === 'POST') {
    if (!session || !['admin','user'].includes(session.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, body, imageUrl, price } = req.body;
    if (!title || !body || !imageUrl) {
      return res.status(400).json({ error: 'Trūksta laukų' });
    }
    const article = await Article.create({
      title, body, imageUrl,
      price: price ?? 5,
      author: session.user.id,
      buyers: []
    });
    return res.status(201).json(article);
  }


  if (req.method === 'GET') {
    const list = await Article.find({}, 'title imageUrl price createdAt');
    return res.status(200).json(list);
  }

  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end('Method Not Allowed');
}