
import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../../auth/[...nextauth]';
import dbConnect            from '@/lib/dbConnect';
import Article              from '@/models/Article';
import mongoose             from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) Check auth
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();

  // 2) Find the article
  const { id } = req.query;
  const art = await Article.findById(id);
  if (!art) {
    return res.status(404).json({ error: 'Straipsnis nerastas' });
  }

  // 3) Authorization: only author or admin can delete
  const userId   = session.user.id;
  const isAuthor = art.author.toString() === userId;
  const isAdmin  = session.user.role === 'admin';
  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 4) Delete the article document
  await art.deleteOne();

  // (Optionally: delete its GridFS image, etc.)

  return res.status(200).json({ success: true });
}
