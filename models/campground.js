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

const opts = { toJSON: { virtuals: true } }

const campgroundSchema = new Schema({
  title: String,
  images: [imageSchema],
  // working with geoJSON
  geometry: {
    type: {
      type: String, 
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], 
      required: true
    }
  },
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
}, opts) 

// virtual to create properties property for mapbox
campgroundSchema.virtual('properties.popUpMarkup').get(function() {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0,100)}...</p>`
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