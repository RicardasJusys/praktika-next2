import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body:  { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, default: 10 },         
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);