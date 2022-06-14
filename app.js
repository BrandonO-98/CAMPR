const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

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

app.get('/', (req, res)=> {
  res.render('home')
})

app.get('/campgrounds', async (req, res)=> {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res)=> {
  const newCampground = new Campground(req.body.campground)
  await newCampground.save()
  res.redirect(`/campgrounds/${newCampground._id}`)
})

app.get('/campgrounds/:id', async (req, res)=> {
  const {id} = req.params;
  const campground = await Campground.findById(id)
  res.render('campgrounds/show', {campground})
})

app.get('/campgrounds/:id/edit', async (req, res)=> {
  const {id} = req.params;
  // campground to be edited
  const editCampground = await Campground.findById(id)
  res.render('campgrounds/edit', {editCampground})
})

app.put('/campgrounds/:id', async (req, res)=> {
  const {id} = req.params;
  const editedCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
  res.redirect(`/campgrounds/${editedCampground._id}`)
})

app.delete('/campgrounds/:id', async (req, res)=> {
  const {id} = req.params;
  const deletedCampground = await Campground.findByIdAndDelete(id)
  res.redirect('/campgrounds')
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})