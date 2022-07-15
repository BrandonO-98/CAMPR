const express = require('express')
const router = express.Router({ mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const reviewContorller = require('../controllers/reviewController')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

router.post('/', isLoggedIn, validateReview, catchAsync(reviewContorller.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewContorller.deleteReview))

module.exports = router