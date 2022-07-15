const User = require('../models/user')

module.exports.renderRegisterForm = (req, res) => {
  res.render('users/register')
}

module.exports.register = async (req, res) => {
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
}

module.exports.renderLoginForm = (req, res) => {
  res.render('users/login')
}

module.exports.login = (req, res) => {
  req.flash('success', 'Welcome Back!')
  const redirectUrl = req.session.returnTo || '/campgrounds'
  delete req.session.returnTo
  res.redirect(redirectUrl)
}
module.exports.logout = (req, res, next) => {
  req.logout()
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}