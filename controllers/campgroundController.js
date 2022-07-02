const Campground = require('../models/campground')

module.exports.index = async (req, res)=> {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', {campgrounds})
}
module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res)=> {
  const newCampground = new Campground(req.body.campground)
  // add a user to the new campground, the user mehtod is auto added to the req
  newCampground.author = req.user._id
  await newCampground.save()
  req.flash('success', 'Successfully made a new campground!')
  res.redirect(`/campgrounds/${newCampground._id}`)
}

module.exports.showCampground = async (req, res)=> {
  const {id} = req.params;
  // populate each review and again populat each author of each review, 
  //then populate the one author of the campground
  const campground = await Campground.findById(id).populate({
    path: 'reviews',
    populate: {
      path:'author'
    }
}).populate('author')
  // if this campground was bookmarked but later removed the ejs
  //will render with an error.
  if (!campground) {
    req.flash('error', 'Cannot find that campground!')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/show', {campground})
}

module.exports.renderEditForm = async (req, res)=> {
  const {id} = req.params;
  // campground to be edited
  const editCampground = await Campground.findById(id)
  if (!editCampground) {
    req.flash('error', 'Cannot find that campground!')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', {editCampground})
}

module.exports.editCampground = async (req, res)=> {
  const {id} = req.params;
  const editedCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
  req.flash('success', 'Successfully updated campground!')
  res.redirect(`/campgrounds/${editedCampground._id}`)
}

module.exports.deleteCampground = async (req, res)=> {
  const {id} = req.params;
  const deletedCampground = await Campground.findByIdAndDelete(id)
  req.flash('success', 'Successfully deleted campground.')
  res.redirect('/campgrounds')
}