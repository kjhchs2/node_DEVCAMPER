const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Routes Files
const bootcamps = require('./routes/bootcamps');

// LOAD ENV VARS
dotenv.config({ path: './config/config.env'});

const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server running on ${PORT} and in ${process.env.NODE_ENV}`));