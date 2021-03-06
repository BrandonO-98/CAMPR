if (process.env.NODE_ENV !== "production") {
  require('dotenv').config()
}

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const mongoStore = require('connect-mongo')(session)

const userRoutes = require('./routes/userRoutes')
const campgroundRoutes = require('./routes/campgroundRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/campr'

mongoose.connect(dbUrl)
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
app.use(mongoSanitize())

const secret = process.env.SECRET || 'thisismysecret'

const store = new mongoStore({
  url:dbUrl,
  secret,
  // if the session data hasn't changed don't reupdate until after 24hrs
  touchAfter: 24 * 60 * 60
})

store.on('error', function(e) {
  console.log('Session store error', e)
})

const sessionConfig = {
  store, 
  name: 'session',
  secret, 
  resave: false,
  saveUninitialized: true,
  cookie: {
    // cookies cannot be accessed via JS
    httpOnly: true,
    // cookies can only be accessed over https
    // secure: true,
    // give the cookie an expiry, if this is not defined
    //a logged in user could be logged in forever
    expires: Date.now() + 1000 * 60 * 60 *24 *7,
    maxAge: 1000 * 60 * 60 *24 *7
  }
}
app.use(session(sessionConfig))
app.use(flash())

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/da6su05rx/"
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/da6su05rx/"
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/da6su05rx/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/da6su05rx/" ];

app.use(
  helmet({
      contentSecurityPolicy: {
          directives : {
              defaultSrc : [],
              connectSrc : [ "'self'", ...connectSrcUrls ],
              scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
              styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
              workerSrc  : [ "'self'", "blob:" ],
              objectSrc  : [],
              imgSrc     : [
                  "'self'",
                  "blob:",
                  "data:",
                  "https://res.cloudinary.com/da6su05rx/", 
                  "https://images.unsplash.com/"
              ],
              fontSrc    : [ "'self'", ...fontSrcUrls ],
              // mediaSrc   : [ "https://res.cloudinary.com/da6su05rx/" ],
              // childSrc   : [ "blob:" ]
          }
      },
      crossOriginEmbedderPolicy: false
  })
);

app.use(passport.initialize())
app.use(passport.session())
// use Local authentication
passport.use(new LocalStrategy(User.authenticate()))
// how to store data in session
passport.serializeUser(User.serializeUser())
// how to remove data from session
passport.deserializeUser(User.deserializeUser())

// add user to the local storage accessible only by views
app.use((req, res, next) => {
    // store the url requested if comming from anything but home and login pgs
  if (!['/login', '/'].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl
    // console.log(req.session.returnTo, 'app.js151')
  }
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  // on authenticate method, req.user is auto set to the logged in user
  res.locals.currentUser = req.user
  next()
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res)=> {
  res.render('campgrounds/home')
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

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})