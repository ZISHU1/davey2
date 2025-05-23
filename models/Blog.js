// models/Blog.js

const mongoose = require('mongoose');
const slugify = require('slugify');

const CommentSchema = new mongoose.Schema({
  name: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  comments: { type: [CommentSchema], default: [] }
});

// Auto-generate a unique slug from the title
BlogSchema.pre('validate', async function(next) {
  if (this.title) {
    let base = slugify(this.title, { lower: true, strict: true });
    let slug = base;
    let count = 1;
    // Check for existing slugs and append a counter if needed
    while (await mongoose.models.Blog.findOne({ slug })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);
