const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  name: { type: String },
  payId: { type: String, required: true },
  customMessage: { type: String }, 
  requestValue: { type: Number, required: true },
  requestCurrency: { type: String, required: true }
});

PaymentSchema.method({});

PaymentSchema.static({});

module.exports = mongoose.model("Payments", PaymentSchema)
