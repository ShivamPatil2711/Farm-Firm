const Farmer = require('../models/Farmer');
const Firm = require('../models/Firm');
const FriendRequest = require('../models/FriendRequest');
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
       console.log("Combined users list:", allUsers); // Debug log to check the combined list of users
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