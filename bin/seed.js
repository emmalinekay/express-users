const mongoose = require('mongoose');

require('dotenv').config(); //load environment variables from env file

mongoose.connect(process.env.MONGODB_URI); //defined in the env file

//connect to database with MONGODB_URI environment variables
console.log('example of seed file running. ');
