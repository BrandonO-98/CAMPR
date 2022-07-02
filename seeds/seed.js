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
    const price = Math.floor(Math.random()*30) +5
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      author: '62bb5a8eee521718fdc4d5ab',
      title: `${sample(descriptors)} ${sample(places)}`,
      image: 'https://source.unsplash.com/collection/483251',
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Quae eligendi, assumenda a ut saepe dolor natus vitae cumque eveniet 
        dolorum delectus. Saepe consectetur, sit culpa pariatur, temporibus velit 
        sequi ab laudantium quae aspernatur dignissimos! Voluptatum, alias voluptatem 
        doloremque quae ab eos nesciunt tempora velit repellendus dolorem quis 
        repudiandae architecto facere.`,
        price: price
    })
    await camp.save()
  }
}

// after seeding database, close connection
seedDB().then(() => {
  mongoose.connection.close()
})