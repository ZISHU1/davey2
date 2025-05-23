// models/VisitLog.js
const mongoose = require('mongoose');

const visitLogSchema = new mongoose.Schema({
  path: String,
  ip: String,
  geo: {
    country: String,
    region: String,
    city: String
  },
  ua: {
    browser: String,
    os: String,
    device: String
  },
  responseTimeMs: Number,
  isUnique: Boolean,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VisitLog', visitLogSchema);
