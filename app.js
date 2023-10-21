const express = require('express');
const app = express();
const feedRoutes = require('./routes/feed');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');



app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type , Autherization');
    next();
})
app.use('/feed', feedRoutes);

mongoose
  .connect(
    'mongodb+srv://Hazzem:w7d%405PvY.X_eGgY@cluster0.8xqeba5.mongodb.net/messages?retryWrites=true&w=majority'
  )
  .then(result => {
    console.log(result)
    app.listen(8080)
  })
  .catch(err => console.log(err))

