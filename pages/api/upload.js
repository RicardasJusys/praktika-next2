import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  }
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: err.message });
    }


    const fileObj = Array.isArray(files.file)
      ? files.file[0]
      : files.file || Object.values(files)[0];
    if (!fileObj) {
      return res.status(400).json({ error: 'No file uploaded' });
    }


    const rawPath = fileObj.filepath || fileObj.path;
    if (!rawPath) {
      return res.status(500).json({ error: 'Cannot determine file path' });
    }


    const publicUrl = rawPath.replace(
      path.join(process.cwd(), 'public'),
      ''
    ).split(path.sep).join('/');

    return res.status(200).json({ url: publicUrl });
  });
}
