const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const passport = require('passport')

router.get('/register', (req, res) => {
  res.render('users/register')
})

// the catch Async will catch errors in the catch clause of the try/catch
router.post('/register', catchAsync(async (req, res) => {
  try { 
  const {email, username, password} = req.body
  const newUser = new User({email, username})
  const registeredUser = await User.register(newUser, password)
  // login the newly registered user
  req.login(registeredUser, err => {
    if (err) return next(err)
    req.flash('success', 'Registered! Welcome to Campr!')
    res.redirect('/campgrounds')
    })
  } catch (err) {
  req.flash('error', err.message)
  res.redirect('/register')
  }
}))

router.get('/login', (req, res) => {
  res.render('users/login')
})

router.post('/login', passport.authenticate('local', {
  failureFlash: true, 
  failureRedirect: '/login'
}), (req, res) => {
  req.flash('success', 'Welcome Back!')
  const redirectUrl = req.session.returnTo || '/campgrounds'
  delete req.session.returnTo
  res.redirect(redirectUrl)
})

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
  });
}); 

module.exports = router