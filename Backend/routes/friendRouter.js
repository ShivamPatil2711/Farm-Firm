const express = require('express');
const friendrouter = express.Router();
const friendController = require('../controllers/friendController');
friendrouter.get('/api/users', friendController.getAllUsers);
friendrouter.get('/api/friend-profile/:id', friendController.getFriendProfile);
friendrouter.post('/api/friend-request', friendController.PostFriendRequest);
friendrouter.get('/api/friend-requests/:userId', friendController.getFriendRequests);
friendrouter.post('/api/friend-requests/accept/:reqId', friendController.acceptFriendRequest);
friendrouter.post('/api/friend-requests/reject/:reqId', friendController.rejectFriendRequest);

module.exports = friendrouter;
