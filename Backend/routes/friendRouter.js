const express = require('express');
const friendrouter = express.Router();
const friendController = require('../controllers/friendController');
const reviewController = require('../controllers/reviewController');
friendrouter.get('/api/users', friendController.getAllUsers);
friendrouter.get('/api/friend-profile/:id', friendController.getFriendProfile);
friendrouter.post('/api/friend-request', friendController.PostFriendRequest);
friendrouter.get('/api/friend-requests/:userId', friendController.getFriendRequests);
friendrouter.post('/api/friend-requests/accept/:reqId', friendController.acceptFriendRequest);
friendrouter.post('/api/friend-requests/reject/:reqId', friendController.rejectFriendRequest);

friendrouter.get('/api/suggest-firms', friendController.getSuggestedFirms);
friendrouter.get('/api/suggest-farmers', friendController.getSuggestedFarmers);
friendrouter.get('/api/reviews/requests/:requestId', reviewController.getRequestReview);
friendrouter.post('/api/reviews/requests/:requestId', reviewController.createOrUpdateRequestReview);
friendrouter.get('/api/reviews/firms/:firmId', reviewController.getFirmReviews);
friendrouter.get('/api/reviews/firms/:firmId/summary', reviewController.getFirmReviewSummary);

module.exports = friendrouter;
