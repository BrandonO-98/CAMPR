const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')

module.exports.index = async (req, res)=> {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', {campgrounds})
}
module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res)=> {
  const newCampground = new Campground(req.body.campground)
  newCampground.images = req.files.map(file => ({url: file.path, filename: file.filename}))
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
  console.log(req.body)
  const editedCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
  // We don't want to replace but add to the images array
  const images = req.files.map(file => ({url: file.path, filename: file.filename}))
  editedCampground.images.push(...images)
  await editedCampground.save()

  if (req.body.deleteImages) {
    for (let file of req.body.deleteImages) {
      await cloudinary.uploader.destroy(file)
    }
    await editedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } }}})
  }
  req.flash('success', 'Successfully updated campground!')
  res.redirect(`/campgrounds/${editedCampground._id}`)
}

module.exports.deleteCampground = async (req, res)=> {
  const {id} = req.params;
  const deletedCampground = await Campground.findByIdAndDelete(id)
  req.flash('success', 'Successfully deleted campground.')
  res.redirect('/campgrounds')
}