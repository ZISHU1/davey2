require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const useragent = require('useragent');
const geoip = require('geoip-lite');
const { v4: uuid } = require('uuid');

const PageView = require('./models/PageView');
const VisitLog = require('./models/VisitLog');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  path: '/socket.io'
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Visitor‐logging & real-time emit
app.use(async (req, res, next) => {
  const start = Date.now();
  const pathUrl = req.path;

  // Increment overall pageview
  await PageView.findOneAndUpdate(
    { path: pathUrl },
    { $inc: { count: 1 } },
    { upsert: true }
  );

  // Unique visitor via cookie
  let isNew = false;
  if (!req.cookies.visitorId) {
    res.cookie('visitorId', uuid(), { maxAge: 1000 * 60 * 60 * 24 * 30 });
    isNew = true;
  }

  res.on('finish', async () => {
    const duration = Date.now() - start;
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0];
    const geo = geoip.lookup(ip) || {};
    const ua = useragent.parse(req.headers['user-agent']);

    const visit = await VisitLog.create({
      path: pathUrl,
      ip,
      geo: {
        country: geo.country || 'Unknown',
        region: geo.region || 'Unknown',
        city: geo.city || 'Unknown'
      },
      ua: {
        browser: `${ua.family} ${ua.major}`,
        os: `${ua.os.family} ${ua.os.major}`,
        device: ua.device.family
      },
      responseTimeMs: duration,
      isUnique: isNew
    });

    // Emit to admin namespace
    io.of('/admin').emit('new-visit', {
      ip: visit.ip,
      country: visit.geo.country,
      city: visit.geo.city,
      timestamp: visit.createdAt
    });
  });

  next();
});

// Public routes
app.get('/',      (req, res) => res.render('index',     { active: 'home' }));
app.get('/about', (req, res) => res.render('about',     { active: 'about' }));
app.get('/portfolio', (req, res) => res.render('portfolio', { active: 'portfolio' }));
app.get('/contact',   (req, res) => res.render('contact',   { active: 'contact' }));

// Blog + Admin routes
app.use('/blogs', blogRoutes);
app.use('/admin', adminRoutes);

// 404
app.use((req, res) => res.status(404).render('404', { active: null }));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
