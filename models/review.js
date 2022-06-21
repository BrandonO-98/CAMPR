const mongoose = require('mongoose')
const { Schema } = mongoose;

const reviewScehma = new Schema({
  body: String,
  rating: Number,
}) 

module.exports = mongoose.model('Review', reviewScehma)