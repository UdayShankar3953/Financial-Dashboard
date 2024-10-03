const mongoose = require('mongoose');

const financialSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  income: { type: Number, required: true },
  expenses: { type: Number, required: true },
  savings: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Financial = mongoose.model('Financial', financialSchema);

module.exports = Financial;
