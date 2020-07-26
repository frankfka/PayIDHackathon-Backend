const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  name: { type: String },
  payId: { type: String, required: true },
  customMessage: { type: String }, 
  requestedAmount: {
    value: { type: Number, required: true },
    currencyCode: { type: String, required: true }
  },
  paymentOptions: [{
    currencyCode: { type: String},
    value: { type: Number },
    address: { type: String }
  }]
});

PaymentSchema.method({});

PaymentSchema.static({});

module.exports = mongoose.model("Payments", PaymentSchema)
