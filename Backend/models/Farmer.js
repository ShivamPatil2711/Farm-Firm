const mongoose=require("mongoose");
const FarmerSchema=mongoose.Schema({// Structure of the Table BLUEPRINT OF THE TABLE
FirstName:{type:String,required:true},
LastName:{type:String,required:true}, 
email:{type:String,required:true},
password:{type:String,required:true},
phoneNumber:{type:String,required:true},
listedCrops:[{type:mongoose.Schema.Types.ObjectId,ref:"Crop"}],
city:{type:String,required:true},
state:{type:String,required:true},
farmerfriend:[{type:mongoose.Schema.Types.ObjectId,ref:"Farmer"}],
firmfriend:[{type:mongoose.Schema.Types.ObjectId,ref:"Firm"}],
});
module.exports=mongoose.model("Farmer",FarmerSchema);// Class name Farmer + it acts as both class + table
