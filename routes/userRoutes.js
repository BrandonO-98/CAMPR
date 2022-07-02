const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const userController = require('../controllers/userController')
const passport = require('passport')

router.route('/register')
  .get(userController.renderRegisterForm)
  // the catch Async will catch errors in the catch clause of the try/catch
  .post(catchAsync(userController.register))

router.route('/login')
  .get(userController.renderLoginForm)
  .post(passport.authenticate('local', {
    failureFlash: true, 
    failureRedirect: '/login'
  }), userController.login)

router.get('/logout', userController.logout);


module.exports = router