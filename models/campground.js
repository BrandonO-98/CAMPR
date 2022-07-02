const mongoose = require('mongoose')
const Review = require('./review')
const { Schema } = mongoose;

const campgroundSchema = new Schema({
  title: String,
  image: String,
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

// remov reviews after deleting a campground
campgroundSchema.post('findOneAndDelete', async function(doc) {
  if(doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews}
    })
  }
})

module.exports = mongoose.model('Campground', campgroundSchema)