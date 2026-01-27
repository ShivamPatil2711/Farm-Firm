const mongoose = require("mongoose");
const firmSchema = mongoose.Schema({// Structure of the Table BLUEPRINT OF THE TABLE
  CompanyName: { type: String, required: true },
  ContactPerson: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
 city: { type: String, required: true },
  state: { type: String, required: true }
}
);
module.exports = mongoose.model("Firm", firmSchema);// Class name Firm + it acts as both class + table


