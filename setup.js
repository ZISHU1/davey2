// setup-structure.js
const fs = require('fs');
const path = require('path');

// 1. Directories to ensure
const dirs = [
  'models',
  'public/css',
  'public/js',
  'public/images',
  'routes',
  'views/partials'
];

// 2. Files to ensure
const files = [
  'app.js',
  'package.json',
  'package-lock.json',
  'models/Blog.js',
  'public/css/style.css',
  'public/js/script.js',
  'routes/blogRoutes.js',
  'views/index.ejs',
  'views/about.ejs',
  'views/portfolio.ejs',
  'views/contact.ejs',
  'views/post.ejs',
  'views/admin.ejs',
  'views/404.ejs',
  'views/partials/header.ejs',
  'views/partials/footer.ejs'
];

// Helper to create a directory if missing
for (const dir of dirs) {
  const full = path.join(__dirname, dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Dir exists:        ${dir}`);
  }
}

// Helper to create an empty file if missing
for (const file of files) {
  const full = path.join(__dirname, file);
  const dir = path.dirname(full);
  // ensure parent dir exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  (also created parent dir) ${dir}`);
  }
  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, '', 'utf8');
    console.log(`Created file:      ${file}`);
  } else {
    console.log(`File exists:       ${file}`);
  }
}

console.log('Setup complete.');
