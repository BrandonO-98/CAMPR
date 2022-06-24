const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const {campgroundSchema} = require('../ValidationSchemas')


const validateCampground = (req, res, next) => {
  
  const {error} = campgroundSchema.validate(req.body)
  if(error) {
    const msg = error.details.map(ele=>ele.message).join(',')
    throw new ExpressError(msg, 400)
  }
  next();
} 

router.get('/', catchAsync(async (req, res)=> {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', {campgrounds})
}))

router.get('/new', (req, res) => {
  res.render('campgrounds/new')
})

router.post('/', validateCampground, catchAsync(async (req, res)=> {
  const newCampground = new Campground(req.body.campground)
  await newCampground.save()
  req.flash('success', 'Successfully made a new campground!')
  res.redirect(`/campgrounds/${newCampground._id}`)
}))

router.get('/:id', catchAsync(async (req, res)=> {
  const {id} = req.params;
  const campground = await Campground.findById(id).populate('reviews')
  // if this campground was bookmarked but later removed the ejs
  //will render with an error.
  if (!campground) {
    req.flash('error', 'Cannot find that campground!')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/show', {campground})
}))

router.get('/:id/edit', catchAsync(async (req, res)=> {
  const {id} = req.params;
  // campground to be edited
  const editCampground = await Campground.findById(id)
  if (!editCampground) {
    req.flash('error', 'Cannot find that campground!')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', {editCampground})
}))

router.put('/:id', validateCampground, catchAsync(async (req, res)=> {
  const {id} = req.params;
  const editedCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
  req.flash('success', 'Successfully updated campground!')
  res.redirect(`/campgrounds/${editedCampground._id}`)
}))

router.delete('/:id', catchAsync(async (req, res)=> {
  const {id} = req.params;
  const deletedCampground = await Campground.findByIdAndDelete(id)
  req.flash('success', 'Successfully deleted campground.')
  res.redirect('/campgrounds')
}))

module.exports = router