// models/PageView.js
const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  path: { type: String, unique: true },
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model('PageView', pageViewSchema);
