module.exports.isLoggedIn = (req, res, next) => {
  // store the url requested
  req.session.returnTo = req.originalUrl
  if(!req.isAuthenticated()) {
    req.flash('error', 'You must be signed in!')
    return res.redirect('/login')
  }
  next()
}
