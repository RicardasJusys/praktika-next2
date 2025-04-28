import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../../auth/[...nextauth]';
import dbConnect             from '@/lib/dbConnect';
import Article               from '@/models/Article';
import User                  from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();
  const user    = await User.findOne({ email: session.user.email });
  const article = await Article.findById(req.query.id);

  if (!article) {
    return res.status(404).json({ error: 'Straipsnis nerastas' });
  }
  if (user.credits < article.price) {
    return res.status(403).json({ error: 'Insufficient credits' });
  }


  user.credits -= article.price;
  article.buyers.push(user._id);
  await user.save();
  await article.save();

  return res.status(200).json({ remainingCredits: user.credits });
}