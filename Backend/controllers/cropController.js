const mongoose = require('mongoose');
const Crop = require('../models/Crop');     // your Crop model
const Farmer = require('../models/Farmer'); // assuming logged-in user is a Farmer
const Firm = require('../models/Firm');
const Request = require('../models/Request');
const FirmRequest = require('../models/FirmRequest')
exports.getCrops = async (req, res) => {
  try {
    // 🔹 Case 1: Not logged in → NO buyers
    if (!req.isLoggedIn || !req.user) {
      let crops = await Crop.find()
        .populate('userId')
        .lean();

      crops = crops.map(({ buyers, ...rest }) => rest);

      return res.status(200).json({
        success: true,
        crops,
      });
    }

    const userId = req.user._id;
    const userType = req.user.userType;

    // 🔹 Case 2: Farmer → NO buyers
    if (userType === "farmer") {
      let crops = await Crop.find()
        .populate('userId')
        .lean();

      crops = crops.map(({ buyers, ...rest }) => rest);

      return res.status(200).json({
        success: true,
        crops,
      });
    }

    // 🔹 Case 3: Firm → show only firm friends buyers (unique)
    const crops = await Crop.find()
      .populate('userId buyers')
      .lean();

    const firm = await Firm.findById(userId)
      .select('firmfriend')
      .lean();

    const firmFriendIds = (firm?.firmfriend || []).map(id => id.toString());

    const filteredCrops = crops.map(crop => {

      // Filter only firm friends
      const filteredBuyers = (crop.buyers || []).filter(buyer =>
        firmFriendIds.includes(buyer._id.toString())
      );

      // Make unique
      const uniqueBuyersMap = new Map();

      filteredBuyers.forEach(buyer => {
        uniqueBuyersMap.set(buyer._id.toString(), buyer);
      });

      const uniqueBuyers = Array.from(uniqueBuyersMap.values());

      return {
        ...crop,
        buyers: uniqueBuyers,
      };
    });

    return res.status(200).json({
      success: true,
      crops: filteredCrops,
    });

  } catch (error) {
    console.error('Error in getCrops:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch crops',
    });
  }
};
exports.getCropDetails = async (req, res) => {
  try {
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({ error: 'Unauthorized – please log in' });
    }
    const cropId = req.params.cropId;
    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      return res.status(400).json({ error: 'Invalid crop ID' });
    }

    // Fetch the crop document
    const cropDetail = await Crop.findById(cropId);

    if (!cropDetail) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    // Fetch the farmer (host/creator) who listed the crop
    const farmer = await Farmer.findById(cropDetail.userId);
    // Final response
    return res.status(200).json({
      success: true,
      crop: cropDetail,
      farmer: farmer || null,               // will be null if farmer deleted
      isLoggedIn: req.isLoggedIn || false,
    });

  } catch (error) {
    console.error('Error in getCropDetails:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch crop details',
    });
  }
};

exports.updateCrop = async (req, res) => {
  try {
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({ error: 'Unauthorized – please log in' });
    }

    const cropId = req.params.cropId;
    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      return res.status(400).json({ error: 'Invalid crop ID' });
    }
    const updateData = req.body;

    // Update the crop document
    const updatedCrop = await Crop.findByIdAndUpdate(cropId, updateData);

    if (!updatedCrop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Crop updated successfully',
      crop: updatedCrop,
    });
  } catch (error) {
    console.error('Error in updateCrop:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update crop',
    });
  }
};
exports.getAllRequests = async (req, res) => {
  try {
    // Not logged in -> show all pending requests
    if (!req.isLoggedIn || !req.user) {
      const requests = await FirmRequest.find({ status: "Pending" })
        .populate("firmId");

      return res.status(200).json({
        success: true,
        requests,
      });
    }

    const { _id: userId, userType } = req.user;

    // Farmer -> show all pending requests
    if (userType === "farmer") {
      const requests = await FirmRequest.find({ status: "Pending" })
        .populate("firmId");

      return res.status(200).json({
        success: true,
        requests,
      });
    }

    // Firm -> show ALL requests created by this firm (all statuses)
    if (userType === "firm") {
      const requests = await FirmRequest.find({ firmId: userId })
        .populate("firmId")
        .populate("farmerId");

      return res.status(200).json({
        success: true,
        requests,
      });
    }

    return res.status(403).json({
      success: false,
      error: "Invalid user type",
    });

  } catch (error) {
    console.error("Error in getAllRequests:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch requests",
    });
  }
};
exports.deleteCrop = async (req, res) => {
  try {
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({ error: 'Unauthorized – please log in' });
    } 
    const cropId = req.params.cropId;
    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      return res.status(400).json({ error: 'Invalid crop ID' });
    }
    const deletedCrop = await Crop.findByIdAndDelete(cropId);
    if (!deletedCrop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Crop deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteCrop:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to delete crop',
    });
  }
};