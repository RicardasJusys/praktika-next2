// pages/api/articles/index.js
import { getServerSession } from 'next-auth/next'
import { authOptions }      from '../auth/[...nextauth]'  // adjust path if needed
import dbConnect            from '@/lib/dbConnect'
import Article              from '@/models/Article'

export default async function handler(req, res) {
  await dbConnect()

  // GET /api/articles → list all articles
  if (req.method === 'GET') {
    const list = await Article.find({})
      .select('title imageUrl price author createdAt')
      .lean()
    // convert _id to string
    const articles = list.map(a => ({
      ...a,
      _id: a._id.toString(),
      author: a.author.toString(),
      createdAt: a.createdAt.toISOString(),
    }))
    return res.status(200).json(articles)
  }

  // POST /api/articles → create new article
  if (req.method === 'POST') {
    // 1) require authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { title, body, imageUrl, price } = req.body
    if (!title || !body || !imageUrl || !price) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // 2) create
    const newArt = await Article.create({
      title,
      body,
      imageUrl,
      price,
      author: session.user.id,
      buyers: [],      // nobody’s bought it yet
    })

    return res.status(201).json({ _id: newArt._id.toString() })
  }

  // anything else
  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
