// routes/blogRoutes.js

const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// List all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.render('blogs', { blogs, active: 'blogs' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading blogs');
  }
});

// Create a new blog (admin)
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const blog = new Blog({ title, content });
    await blog.save();
    res.redirect('/blogs');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving blog');
  }
});

// View single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).render('404', { active: null });
    res.render('post', { post });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading post');
  }
});

// Submit a comment
router.post('/:slug/comment', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).send('Blog post not found');

    post.comments.push({
      name: req.body.name,
      message: req.body.message
    });
    await post.save();

    res.redirect(`/blogs/${post.slug}#comments`);
  } catch (err) {
    console.error('Error saving comment:', err);
    res.status(500).send('Error saving comment');
  }
});

module.exports = router;
