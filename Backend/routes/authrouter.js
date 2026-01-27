const express = require('express');
const authrouter = express.Router();
const authController = require('../controllers/authController');
authrouter.post('/api/login', authController.postLogin);
authrouter.post('/api/signup/:usertype', authController.postSignup);
authrouter.get('/api/check-auth', authController.checkAuth);
authrouter.post('/api/logout', authController.postLogout);
authrouter.get('/api/profile',authController.getProfile);
module.exports = authrouter; 