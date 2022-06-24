const express = require('express')
const router = express.Router({ mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Review = require('../models/review')
const Campground = require('../models/campground')
const {reviewSchema} = require('../ValidationSchemas')

const validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body)
  if(error) {
    const msg = error.details.map(ele=>ele.message).join(',')
    throw new ExpressError(msg, 400)
  }
  next();
}

router.post('/', validateReview, catchAsync(async (req,res) => {
  const {id} = req.params
  const campground = await Campground.findById(id)
  const review = new Review(req.body.review)
  campground.reviews.push(review)
  await review.save()
  await campground.save()
  req.flash('success', 'Created a new review!')
  res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async(req,res) => {
  const {id, reviewId} = req.params
  // remove the ref to the review with reviewId from the found campground
  const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
  await Review.findByIdAndDelete(reviewId)
  req.flash('success', 'Successfully deleted review')
  res.redirect(`/campgrounds/${campground._id}`)
}))

module.exports = router