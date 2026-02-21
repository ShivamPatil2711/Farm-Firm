const mongoose = require('mongoose');

const FirmRequestSchema = new mongoose.Schema({
      cropname: { type: String, required: true },
   deadline: {
    type: Date,
    required: true
  },
    requirement:{
type:Number,
required:true
    },
  status:{
    type:String,
    default : "Pending"
  },
   firmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Firm',  // or 'User' — depending on your auth model
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',  // or 'User' — depending on your auth model
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
 
}, {
  timestamps: true
});
module.exports = mongoose.model('FirmRequest', FirmRequestSchema);