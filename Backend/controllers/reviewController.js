const mongoose = require('mongoose');
const Farmer = require('../models/Farmer');
const Firm = require('../models/Firm');
const Request = require('../models/Request');
const Review = require('../models/Review');
const ReviewSummary = require('../models/ReviewSummary');

const isEligibleRequest = (request, farmerId) =>
  request &&
  request.farmerId &&
  request.farmerId.toString() === farmerId.toString() &&
  ['accepted', 'completed'].includes(String(request.status).toLowerCase());

const getEligibleRequest = async (requestId, farmerId) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return null;
  }

  const request = await Request.findById(requestId);
  return isEligibleRequest(request, farmerId) ? request : null;
};

exports.getRequestReview = async (req, res) => {
  try {
    if (!req.isLoggedIn || !req.user || req.user.userType !== 'farmer') {
      return res.status(401).json({ success: false, error: 'Only logged-in farmers can view reviews' });
    }

    const request = await getEligibleRequest(req.params.requestId, req.user._id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Review is available only for your accepted or completed requests' });
    }

    const review = await Review.findOne({
      farmer: req.user._id,
      firm: request.firmId
    });

    return res.status(200).json({ success: true, review });
  } catch (error) {
    console.error('Error fetching request review:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch review' });
  }
};

exports.createOrUpdateRequestReview = async (req, res) => {
  try {
    if (!req.isLoggedIn || !req.user || req.user.userType !== 'farmer') {
      return res.status(401).json({ success: false, error: 'Only logged-in farmers can submit reviews' });
    }

    const request = await getEligibleRequest(req.params.requestId, req.user._id);
    if (!request) {
      return res.status(403).json({ success: false, error: 'Reviews are available only for your accepted or completed requests' });
    }

    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be a whole number from 1 to 5' });
    }

    if (comment.length > 1000) {
      return res.status(400).json({ success: false, error: 'Review comment cannot exceed 1000 characters' });
    }

    const review = await Review.findOneAndUpdate(
      { farmer: req.user._id, firm: request.firmId },
      {
        farmer: req.user._id,
        firm: request.firmId,
        request: request._id,
        rating,
        comment
      },
      { new: true, upsert: true, runValidators: true }
    );
    await ReviewSummary.deleteOne({ firm: request.firmId });

    return res.status(200).json({ success: true, review, message: 'Review saved successfully' });
  } catch (error) {
    console.error('Error saving request review:', error);
    return res.status(500).json({ success: false, error: 'Failed to save review' });
  }
};

exports.getFirmReviewSummary = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.firmId)) {
      return res.status(400).json({ success: false, error: 'Invalid firm ID' });
    }

    const firm = await Firm.findById(req.params.firmId).select('CompanyName');
    if (!firm) return res.status(404).json({ success: false, error: 'Firm not found' });

    const reviews = await Review.find({
      firm: firm._id,
      comment: { $exists: true, $ne: '' }
    }).select('rating comment').sort({ createdAt: -1 }).limit(30);

    if (reviews.length < 3) {
      return res.status(200).json({
        success: true,
        available: false,
        reviewCount: reviews.length
      });
    }

    const cached = await ReviewSummary.findOne({
      firm: firm._id,
      reviewCount: reviews.length
    });
    if (cached) {
      return res.status(200).json({ success: true, available: true, summary: cached });
    }

    const mlUrl = `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/api/ml/reviews/summarize`;
    const mlResponse = await fetch(mlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews })
    });
    if (!mlResponse.ok) {
      throw new Error(`Review summary service returned ${mlResponse.status}`);
    }

    const generated = await mlResponse.json();
    const summary = await ReviewSummary.findOneAndUpdate(
      { firm: firm._id },
      {
        firm: firm._id,
        ...generated,
        reviewCount: reviews.length,
        model: process.env.REVIEW_SUMMARY_MODEL || 'Qwen/Qwen2.5-1.5B-Instruct',
        generatedAt: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, available: true, summary });
  } catch (error) {
    console.error('Error generating firm review summary:', error);
    return res.status(503).json({ success: false, error: 'AI review summary is temporarily unavailable' });
  }
};

exports.getFirmReviews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.firmId)) {
      return res.status(400).json({ success: false, error: 'Invalid firm ID' });
    }

    const firm = await Firm.findById(req.params.firmId).select('CompanyName');
    if (!firm) {
      return res.status(404).json({ success: false, error: 'Firm not found' });
    }

    const viewerFriendIds = req.isLoggedIn && req.user?.userType === 'farmer'
      ? (await Farmer.findById(req.user._id).select('farmerfriend').lean())?.farmerfriend || []
      : [];
    const friendIdSet = new Set(viewerFriendIds.map((friendId) => friendId.toString()));

    const [reviews, summary] = await Promise.all([
      Review.find({ firm: firm._id })
        .populate('farmer', 'FirstName LastName')
        .sort({ createdAt: -1 }),
      Review.aggregate([
        { $match: { firm: firm._id } },
        {
          $group: {
            _id: '$firm',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 }
          }
        }
      ])
    ]);

    const reviewsWithFriendStatus = reviews.map((review) => {
      const reviewData = review.toObject();
      return {
        ...reviewData,
        isFriend: Boolean(reviewData.farmer?._id && friendIdSet.has(reviewData.farmer._id.toString()))
      };
    });

    return res.status(200).json({
      success: true,
      firm: { _id: firm._id, CompanyName: firm.CompanyName },
      viewerCanFilterFriends: req.isLoggedIn && req.user?.userType === 'farmer',
      summary: summary[0]
        ? {
            averageRating: Number(summary[0].averageRating.toFixed(1)),
            reviewCount: summary[0].reviewCount
          }
        : { averageRating: 0, reviewCount: 0 },
      reviews: reviewsWithFriendStatus
    });
  } catch (error) {
    console.error('Error fetching firm reviews:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch firm reviews' });
  }
};
