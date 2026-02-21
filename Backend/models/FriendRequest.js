const mongoose = require('mongoose');
const FriendRequestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
     required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
   required: true
  },
  senderType:{
  type:String,
  enum: ['farmer', 'firm'],
  required: true
  },
 receiverType:{
  type:String,
  enum: ['farmer', 'firm'],
  required: true
 },
 status:{
    type:String,
    default : "Pending"
  },
}, {
  timestamps: true
});
module.exports = mongoose.model('FriendRequest', FriendRequestSchema);