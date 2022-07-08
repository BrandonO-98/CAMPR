const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const campgroundController = require('../controllers/campgroundController')
const { isLoggedIn, validateCampground, isAuthor} = require('../middleware')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
  .get(catchAsync(campgroundController.index))
  // we are validating after we  upload this should't be
  .post(isLoggedIn,  upload.array('image'), validateCampground, catchAsync(campgroundController.createCampground))


router.get('/new', isLoggedIn, campgroundController.renderNewForm)

router.route('/:id')
  .get(catchAsync(campgroundController.showCampground))
  .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgroundController.editCampground))
  .delete( isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground))

  router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.renderEditForm))

module.exports = router