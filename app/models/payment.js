const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  name: { type: String },
  payId: { type: String, required: true },
  customMessage: { type: String }, 
  requestedAmount: {
    value: { type: Number },
    currencyCode: { type: String }
  },
  paymentOptions: []
});

PaymentSchema.method({});

PaymentSchema.static({});

module.exports = mongoose.model("Payments", PaymentSchema)
