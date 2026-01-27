const mongoose = require("mongoose");
const cropSchema = mongoose.Schema({// Structure of the Table BLUEPRINT OF THE TABLE
  cropname: { type: String, required: true },
  price:{type:Number ,required:true},
  minquantity :{ type:Number ,required:true},
  totalavailable:{type: Number ,required:true},
  img:{type : String,required:true},
  grade:{type : String ,required:true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },

}
);
module.exports = mongoose.model("Crop", cropSchema);// Class name Firm + it acts as both class + table


