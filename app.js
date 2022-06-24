const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const flash = require('connect-flash')

const campgroundRoutes = require('./routes/campgroundRoutes')
const reviewRoutes = require('./routes/reviewRoutes')

mongoose.connect('mongodb://localhost:27017/campr')
.then(()=> {
  console.log("Database Connected!")
})
.catch(err => {
  console.log("Error!")
  console.log(err)
})
mongoose.connection.on('error', err => {
  console.log("Error!")
  console.log(err);
});

const app = express()
// Set ejsMate as the engine/parser of ejs instead of default
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const sessionConfig = {
  secret: 'thisismysecret', 
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // give the cookie an expiry, if this is not defined
    //a logged in user could be logged in forever
    expires: Date.now() + 1000 * 60 * 60 *24 *7,
    maxAge: 1000 * 60 * 60 *24 *7
  }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res)=> {
  res.render('home')
})

// if no route above is matched run this middleware
app.all('*', (req, res, next) => {
  //pass to the next middleware a custom error
  next(new ExpressError('Page Not Found', 404))
})

// the custom error now is the err variable in this middleware
app.use((err, req, res, next) => {
  const {status = 500} = err
  if (!err.message) err.message = 'Sorry, Somthing went wrong!'
  res.status(status).render('error', {err})
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})