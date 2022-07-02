const {campgroundSchema, reviewSchema} = require('./ValidationSchemas')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')
// middleware for returning user to requested url after redirecting them to 
//login
module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
    req.flash('error', 'You must be signed in!')
    return res.redirect('/login')
  }
  next()
}

module.exports.validateCampground = (req, res, next) => {
  const {error} = campgroundSchema.validate(req.body)
  if(error) {
    const msg = error.details.map(ele=>ele.message).join(',')
    throw new ExpressError(msg, 400)
  }
  next();
} 

module.exports.validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body)
  if(error) {
    const msg = error.details.map(ele=>ele.message).join(',')
    throw new ExpressError(msg, 400)
  }
  next();
}

module.exports.isAuthor = async(req, res, next) => {
  const {id} = req.params;
  const campground = await Campground.findById(id)
  // the author is not being populated, it is just and id
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission for that action!')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

module.exports.isReviewAuthor = async(req, res, next) => {
  const { id, reviewid } = req.params;
  const review = await Review.findById(reviewid)
  // the author is not being populated, it is just and id
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission for that action!')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}