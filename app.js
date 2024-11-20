const express = require('express');
const mongoose = require('mongoose');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const path = require('path');
const app = express();
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(express.json()); // application/json

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);



app.use((err, req, res, next) => {
    res.json({
        message: err.message || 'An unknown error occurred!',
    });
});

mongoose.connect(MONGODB_URI)
    .then(result => {
        const PORT = process.env.PORT;
        app.listen(PORT, () => {
            console.log('Server is running on port' + PORT);
        });
    })
    .catch(err => console.error(err));
