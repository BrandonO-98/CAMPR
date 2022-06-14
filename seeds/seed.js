const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descirptors, descriptors} = require('./seedHelpers')

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

const sample = (array) => array[Math.floor(Math.random()*array.length)]

const seedDB = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random()*1000)
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`
    })
    await camp.save()
  }
}

// after seeding database, close connection
seedDB().then(() => {
  mongoose.connection.close()
})