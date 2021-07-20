const express = require('express');
const dotenv = require('dotenv');

// LOAD ENV VARS
dotenv.config({ path: './config/config.env'});

const app = express();

app.get('/', (req, res)=>{
    res.send('hello from expressssss');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server running on ${PORT} and in ${process.env.NODE_ENV}`));