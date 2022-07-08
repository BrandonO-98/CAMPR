const mongoose = require('mongoose')
const Review = require('./review')
const { Schema } = mongoose;

const imageSchema = new Schema({
  url: String,
  filename: String
})

imageSchema.virtual('thumbnail').get(function() {
  return this.url.replace('/upload', '/upload/w_200')
})

const campgroundSchema = new Schema({
  title: String,
  images: [imageSchema],
  price: Number,
  description: String,
  location: String,
  // associate a campground with a user to create permissions
  author: {
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
}) 

// remove reviews after deleting a campground
campgroundSchema.post('findOneAndDelete', async function(doc) {
  if(doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews}
    })
  }
})

module.exports = mongoose.model('Campground', campgroundSchema)