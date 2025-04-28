// lib/gridfs.js
import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import Grid from 'gridfs-stream';

let gfs;
const conn = mongoose.connection;

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const storage = new GridFsStorage({
  db: conn,
  file: (req, file) => ({
    filename: `${Date.now()}-${file.originalname}`,
    bucketName: 'uploads',
  }),
});

export { gfs, storage };
