// pages/api/upload.js
import { v2 as cloudinary } from 'cloudinary';
import formidable            from 'formidable';

export const config = {
  api: { bodyParser: false }
};

// configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function parseForm(req) {
  // v2 API: call formidable(...) to get a parser instance
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!process.env.CLOUDINARY_API_KEY) {
    return res.status(500).json({ error: 'Missing CLOUDINARY_API_KEY' });
  }

  try {
    const { files } = await parseForm(req);

    // Handle the case where files.file may be an array
    let file = files.file;
    if (Array.isArray(file)) {
      file = file[0];
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded under field "file"' });
    }

    // Formidable v2 uses .filepath; older versions use .path
    const localPath = file.filepath || file.path;
    if (!localPath) {
      console.error('Uploaded file object:', file);
      return res.status(500).json({ error: 'Cannot determine local file path' });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localPath, {
      folder:          'praktika_articles',
      use_filename:    true,
      unique_filename: false,
      overwrite:       true,
    });

    return res.status(200).json({ url: uploadResult.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Unknown upload error' });
  }
}
