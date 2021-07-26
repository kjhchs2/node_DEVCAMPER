const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
//단순 color
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db')
 
// LOAD ENV VARS 
dotenv.config({ path: './config/config.env'});

// Connect to database
connectDB();

// Routes Files 
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

const app = express();

// Body Parser 
app.use(express.json());


// Dev logging middleware 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Mount routers 
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

// middleware (위에 bootcamps 보다 반드시 아래 있어야 함) 
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`server running on ${PORT} and in ${process.env.NODE_ENV}`.yellow.bold));

// Handle unhandled promise rejections 
process.on("unhandledRejection", (err, promise) => {
    console.log(`error : ${err.message}`.red);
    // close server & exit process 
    server.close(() => process.exit(1));
});