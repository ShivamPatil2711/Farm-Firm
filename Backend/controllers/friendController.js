const Farmer = require('../models/Farmer');
const Firm = require('../models/Firm');
const FriendRequest = require('../models/FriendRequest');
const Review = require('../models/Review');
exports.getAllUsers = async (req, res) => {
    try {
    let allFarmers = await Farmer.find({}); // Fetch only name, location, and 
     allFarmers = allFarmers.map(farmer => ({
      id: farmer._id,
      name: farmer.FirstName + ' ' + farmer.LastName,
      city: farmer.city,
      state: farmer.state,
      userType: 'farmer' // Add a userType field to distinguish between farmers and firms
    }));
      let allFirms = await Firm.find({});
          allFirms = allFirms.map(firm => ({    
      id: firm._id,
      name: firm.CompanyName,
      city: firm.city,
      state: firm.state,
      userType: 'firm' // Add a userType field to distinguish between farmers and firms
    }));

       const allUsers = [...allFarmers, ...allFirms];
        res.json(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    } 
  }
exports.getFriendProfile = async (req, res) => {
  try {
    const reqId = req.params.id;
    const userType = req.query.userType; // Get userType from query parameters
    let profileData;

    if (userType === 'farmer') {  
      profileData = await Farmer.findById(reqId).select('-password').populate('listedCrops');
    } else if (userType === 'firm') {
      profileData = await Firm.findById(reqId).select('-password');
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid user type specified'
      });
    } 
    if (!profileData) {
      return res.status(404).json({
        success: false, 
        error: 'User not found'
      });
    }
      return res.status(200).json({ 
      success: true,
      profile: profileData
    });
  } catch (error) {
    console.error('Error in getFriendProfile:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user profile',
    });
  }
};
exports.PostFriendRequest = async (req, res) => {
  try {
    const { senderId, receiverId, senderType, receiverType } = req.body;

    // Validate sender and receiver types
    if (!['farmer', 'firm'].includes(senderType) || !['farmer', 'firm'].includes(receiverType)) {
      return res.status(400).json({ message: 'Invalid sender or receiver type' });
    }
    if(senderId===receiverId ){
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }
      const existingRequest = await FriendRequest.findOne({
      senderId,
      receiverId,
      senderType, 
      receiverType,
      });
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }
    const reverseRequest = await FriendRequest.findOne({
      senderId: receiverId,
      receiverId: senderId,
      senderType: receiverType,
      receiverType: senderType,
    }); 
    if(reverseRequest){
      return res.status(400).json({ message: `Friend request already sent. Please accept it from your profile.` });
    }
       if(senderType==="farmer" && receiverType==="farmer"){
      const sender = await Farmer.findById(senderId);
      if (!sender) {
        return res.status(404).json({ message: 'Sender not found' });
      }
      if(sender.farmerfriend.includes(receiverId)){
        return res.status(400).json({ message: 'Already friends' });
      }
    } else if(senderType==="firm" && receiverType==="firm"){
      const sender = await Firm.findById(senderId);
      if (!sender) {
        return res.status(404).json({ message: 'Sender not found' });
      }
      if(sender.firmfriend.includes(receiverId)){
        return res.status(400).json({ message: 'Already friends' });
      }
    } else if(senderType==="farmer" && receiverType==="firm"){
      const sender = await Farmer.findById(senderId); 
      if (!sender) {
        return res.status(404).json({ message: 'Sender not found' });
      }
      if(sender.firmfriend.includes(receiverId)){
        return res.status(400).json({ message: 'Already friends' });
      }
    } else if(senderType==="firm" && receiverType==="farmer"){
      const sender = await Firm.findById(senderId);
      if (!sender) {
        return res.status(404).json({ message: 'Sender not found' });
      }
      if(sender.farmerfriend.includes(receiverId)){
        return res.status(400).json({ message: 'Already friends' });
      }
    } 

      const NewRequest = new FriendRequest({
      senderId,
      receiverId,
      senderType,
      receiverType,
    });
    await NewRequest.save();
    res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.acceptFriendRequest = async (req, res) => {
  try {
    const reqId = req.params.reqId;
    const request = await FriendRequest.findById(reqId);
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
   
    const { senderId, receiverId, senderType, receiverType } = request;

    await FriendRequest.deleteOne({ _id: reqId });
    await FriendRequest.deleteOne({ senderId: receiverId, receiverId: senderId, senderType: receiverType, receiverType: senderType }); // Remove any reverse request if exists
    // Validate sender and receiver types
    if (!['farmer', 'firm'].includes(senderType) || !['farmer', 'firm'].includes(receiverType)) {
      return res.status(400).json({ message: 'Invalid sender or receiver type' });
    } 
 if(senderType==="farmer" && receiverType==="farmer"){
    const sender = await Farmer.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }
    if(sender.farmerfriend.includes(receiverId)){
      return res.status(400).json({ message: 'Already friends' });
    }
    sender.farmerfriend.push(receiverId);
     const receiver = await Farmer.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    receiver.farmerfriend.push(senderId);
    await receiver.save();
    await sender.save();
  } else if(senderType==="firm" && receiverType==="firm"){
    const sender = await Firm.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }
      if(sender.firmfriend.includes(receiverId)){ 
      return res.status(400).json({ message: 'Already friends' });
    }
    sender.firmfriend.push(receiverId);
      const receiver = await Firm.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    receiver.firmfriend.push(senderId);
    await receiver.save();
    await sender.save();
  } else if(senderType==="farmer" && receiverType==="firm"){
    const sender = await Farmer.findById(senderId); 
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }
    if(sender.firmfriend.includes(receiverId)){
      return res.status(400).json({ message: 'Already friends' });
    }
    const receiver = await Firm.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    } 
    receiver.farmerfriend.push(senderId);
    sender.firmfriend.push(receiverId);
    await receiver.save();
    await sender.save();
  } else if(senderType==="firm" && receiverType==="farmer"){
    const sender = await Firm.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    } 
     if(sender.farmerfriend.includes(receiverId)){
      return res.status(400).json({ message: 'Already friends' });
    }
    sender.farmerfriend.push(receiverId);
    const receiver = await Farmer.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    receiver.firmfriend.push(senderId);
    await receiver.save();
    await sender.save();
  } 
    res.status(200).json({ message: 'Friend request accepted successfully' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }   
};
exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    let friendRequests = await FriendRequest.find({
      receiverId: userId,
      status: 'Pending'
    });

    friendRequests = await Promise.all(
      friendRequests.map(async (request) => ({
        _id: request._id,
        senderType: request.senderType,
        sender:
          request.senderType === 'farmer'
            ? await Farmer.findById(request.senderId)
                .select('FirstName LastName city state ')
               : await Firm.findById(request.senderId)
                .select('CompanyName city state '),
                status: request.status,
        timestamp: request.createdAt,
      }))
    );

    res.status(200).json({
      success: true,
      requests: friendRequests
    });

  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friend requests'
    });
  }
};
exports.rejectFriendRequest = async (req, res) => {
  try {
    const reqId = req.params.reqId;
    const request = await FriendRequest.findById(reqId);  
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    await FriendRequest.deleteOne({ _id: reqId });
    res.status(200).json({ message: 'Friend request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Server error' });
}
};

exports.getSuggestedFirms = async (req, res) => {
  try {
    const farmerId = req.user._id;

    // 1. Fetch the current farmer to know their friends, crops, and location
    const farmer = await Farmer.findById(farmerId).populate('listedCrops');
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });

    const farmerFriends = farmer.farmerfriend || [];
    const firmFriends = farmer.firmfriend || [];
    
    // 2. Use MongoDB Aggregation Pipeline to score and sort Firms
    const suggestions = await Firm.aggregate([
      // Step A: Exclude firms that are already friends
      { 
        $match: { 
          _id: { $nin: firmFriends } 
        } 
      },
      // Step B: Calculate Match Scores dynamically
      {
        $addFields: {
          // Find Mutual Friends (Intersection of Firm's farmer friends and Farmer's farmer friends)
          mutualFriends: { $setIntersection: ["$farmerfriend", farmerFriends] },
          
          // Check Location Match
          isSameCity: { $cond: [{ $eq: ["$city", farmer.city] }, 30, 0] },
          isSameState: { $cond: [{ $eq: ["$state", farmer.state] }, 15, 0] }
        }
      },
      {
        $lookup: {
          from: Review.collection.name,
          let: { firmId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$firm", "$$firmId"] },
                    { $ne: ["$farmer", farmer._id] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 }
              }
            }
          ],
          as: "reviewStats"
        }
      },
      {
        $addFields: {
          mutualFriendsCount: { $size: { $ifNull: ["$mutualFriends", []] } },
          averageRating: { $ifNull: [{ $arrayElemAt: ["$reviewStats.averageRating", 0] }, 0] },
          reviewCount: { $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0] }
        }
      },
      {
        $addFields: {
          // A firm's average rating contributes up to 25 points.
          totalScore: {
            $add: [
              { $multiply: [{ $size: { $ifNull: ["$mutualFriends", []] } }, 15] },
              "$isSameCity",
              "$isSameState",
              { $multiply: ["$averageRating", 5] }
            ]
          }
        }
      },
      // Step C: Only keep firms that have some relevance (Score > 0)
      { 
        $match: { 
          totalScore: { $gt: 0 } 
        } 
      },
      // Step D: Sort by highest score
      { 
        $sort: { totalScore: -1 } 
      },
      // Step E: Limit to top 5 suggestions
      { 
        $limit: 5 
      },
      // Step F: Format the output
      {
        $project: {
          CompanyName: 1,
          city: 1,
          state: 1,
          totalScore: 1,
          mutualFriendsCount: 1,
          isSameCity: 1,
          isSameState: 1,
          averageRating: 1,
          reviewCount: 1
        }
      }
    ]);

    res.status(200).json({ success: true, suggestions });

  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getSuggestedFarmers = async (req, res) => {
  try {
    const farmerId = req.user._id;

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });

    const farmerObjectId = farmer._id;
    const farmerFriends = farmer.farmerfriend || [];
    
    const suggestions = await Farmer.aggregate([
      { 
        $match: { 
          _id: {
            $ne: farmerObjectId,
            $nin: farmerFriends
          }
        } 
      },
      {
        $addFields: {
          mutualFriends: { $setIntersection: ["$farmerfriend", farmerFriends] },
          isSameCity: { $cond: [{ $eq: ["$city", farmer.city] }, 30, 0] },
          isSameState: { $cond: [{ $eq: ["$state", farmer.state] }, 15, 0] }
        }
      },
      {
        $addFields: {
          mutualFriendsCount: { $size: { $ifNull: ["$mutualFriends", []] } },
          totalScore: {
            $add: [
              { $multiply: [{ $size: { $ifNull: ["$mutualFriends", []] } }, 15] },
              "$isSameCity",
              "$isSameState"
            ]
          }
        }
      },
      { 
        $match: { 
          totalScore: { $gt: 0 } 
        } 
      },
      { 
        $sort: { totalScore: -1 } 
      },
      { 
        $limit: 5 
      },
      {
        $project: {
          FirstName: 1,
          LastName: 1,
          city: 1,
          state: 1,
          totalScore: 1,
          mutualFriendsCount: 1
        }
      }
    ]);

    res.status(200).json({ success: true, suggestions });

  } catch (error) {
    console.error("Farmer Recommendation Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
