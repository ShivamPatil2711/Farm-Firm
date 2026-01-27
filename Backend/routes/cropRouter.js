const express = require('express');
const croprouter = express.Router();
const cropController = require('../controllers/cropController');
croprouter.get('/api/crops',cropController.getCrops);
croprouter.get('/api/crop-details/:cropId',cropController.getCropDetails);
module.exports = croprouter; 