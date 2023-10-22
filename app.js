const express = require('express')
const app = express()
const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req , file,cb) => {
        cb(null , 'images');
    },
    filename: (req , file , cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null , uniqueSuffix + file.originalname);
    }
});

const fileFilter = (req , file , cb )=> {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){
        cb(null , true);
    }
    else{
        cb(null , false);
    }
}

app.use(bodyParser.json())
app.use(multer({storage: fileStorage , fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type , Autherization')
  next()
})
app.use('/feed', feedRoutes)
app.use('/auth' , authRoutes)
app.use((error, req, res, next) => {
  console.log(error)
  const statusCode = error.statusCode || 500
  const message = error.message
  const data = error.data;
  res.status(statusCode).json({ message: message  , data: data})
})
mongoose
  .connect(
    'mongodb+srv://Hazzem:w7d%405PvY.X_eGgY@cluster0.8xqeba5.mongodb.net/messages?retryWrites=true&w=majority'
  )
  .then(result => {
    console.log('Connected');
    app.listen(8080)
  })
  .catch(err => console.log(err))
