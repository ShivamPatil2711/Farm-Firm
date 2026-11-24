const mongoose = require('mongoose');

const reviewSummarySchema = new mongoose.Schema({
  firm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Firm',
    required: true,
    unique: true
  },
  summary: { type: String, required: true },
  summary_hi: { type: String, default: '' },
  positivePoints: { type: [String], default: [] },
  positivePoints_hi: { type: [String], default: [] },
  concerns: { type: [String], default: [] },
  concerns_hi: { type: [String], default: [] },
  confidence: { type: String, default: 'low' },
  reviewCount: { type: Number, required: true },
  model: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReviewSummary', reviewSummarySchema);
