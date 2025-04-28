// pages/api/images/[id].js
import dbConnect from '@/lib/dbConnect';
import mongoose  from 'mongoose';
import Grid      from 'gridfs-stream';

export default async function handler(req, res) {
  await dbConnect();
  const conn = mongoose.connection;
  const gfs  = Grid(conn.db, mongoose.mongo);

  const fileId = req.query.id;
  try {
    const _id = new mongoose.Types.ObjectId(fileId);
    const readStream = gfs.createReadStream({ _id, root: 'uploads' });
    res.setHeader('Content-Type', 'image/*');
    readStream.pipe(res);
  } catch (err) {
    res.status(404).send('Image not found');
  }
}
