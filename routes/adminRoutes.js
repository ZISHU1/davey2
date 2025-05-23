const express = require('express');
const router = express.Router();
const PageView = require('../models/PageView');
const VisitLog = require('../models/VisitLog');
const Blog = require('../models/Blog');

// Simple password-protect using query param
router.use((req, res, next) => {
  if (req.query.pass !== process.env.ADMIN_PASS) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Dashboard
router.get('/dashboard', async (req, res) => {
  const [totalVisits, totalUniqueVisitors] = await Promise.all([
    VisitLog.countDocuments(),
    VisitLog.countDocuments({ isUnique: true })
  ]);

  const topPages = await PageView.find().sort({ count: -1 }).limit(5);
  const blogViews = await PageView.find({ path: /^\/blogs\/[a-z0-9-]+$/ });

  const recentVisits = await VisitLog.find().sort({ createdAt: -1 }).limit(10);

  const perf = await VisitLog.aggregate([
    { $group: { _id: null, avgMs: { $avg: '$responseTimeMs' } } }
  ]);

  const uniqueCountries = await VisitLog.aggregate([
    { $match: { isUnique: true } },
    { $group: { _id: '$geo.country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const blogs = await Blog.find().sort({ createdAt: -1 });

  res.render('admin', {
    stats: {
      totalVisits,
      totalUniqueVisitors,
      avgResponseMs: perf[0]?.avgMs.toFixed(1) || 0,
      topPages,
      blogViews,
      recentVisits,
      uniqueCountries
    },
    blogs
  });
});

// Edit blog by slug
router.get('/edit/:slug', async (req, res) => {
  const post = await Blog.findOne({ slug: req.params.slug });
  if (!post) return res.status(404).send('Not found');
  res.render('admin-edit', { post });
});

router.post('/edit/:slug', async (req, res) => {
  await Blog.findOneAndUpdate({ slug: req.params.slug }, req.body);
  res.redirect(`/admin/dashboard?pass=${process.env.ADMIN_PASS}`);
});

// Delete blog
router.post('/delete/:slug', async (req, res) => {
  await Blog.findOneAndDelete({ slug: req.params.slug });
  res.redirect(`/admin/dashboard?pass=${process.env.ADMIN_PASS}`);
});
module.exports = router;
