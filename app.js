const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema} = require('./ValidationSchemas')

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

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const validateCampground = (req, res, next) => {
  
  const {error} = campgroundSchema.validate(req.body)
  if(error) {
    const msg = error.details.map(ele=>ele.message).join(',')
    throw new ExpressError(msg, 400)
  }
  next();
}

app.get('/', (req, res)=> {
  res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res)=> {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res)=> {
  // A user can bypass this using postman and sending a campground object thats empty
  // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
  // letting mongoose throw an error whlie it is saving, we can use JOI to do 
  //a check before even interacting with the DB
  const newCampground = new Campground(req.body.campground)
  await newCampground.save()
  res.redirect(`/campgrounds/${newCampground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res)=> {
  const {id} = req.params;
  const campground = await Campground.findById(id)
  res.render('campgrounds/show', {campground})
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res)=> {
  const {id} = req.params;
  // campground to be edited
  const editCampground = await Campground.findById(id)
  res.render('campgrounds/edit', {editCampground})
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res)=> {
  const {id} = req.params;
  const editedCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
  res.redirect(`/campgrounds/${editedCampground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res)=> {
  const {id} = req.params;
  const deletedCampground = await Campground.findByIdAndDelete(id)
  res.redirect('/campgrounds')
}))

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