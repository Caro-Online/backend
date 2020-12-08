//3rd party library
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const httpStatus = require('http-status');
const passport = require('passport');

const { errorConverter, errorHandler } = require('./middlewares/error.mdw');
const ApiError = require('./utils/ApiError');

const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(morgan('dev'));
// app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(passport.initialize());
app.use(passport.session());

require('./middlewares/routes.mdw')(app);

// 404 error for unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Route not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.y0eny.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log('Connect Mongodb Successfully');
    const server = app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });

    const io = require('./utils/socketio').init(server);
    io.on('connection', (socket) => {
      console.log('Client connected ' + socket.id);
      socket.on('disconnect',(reason) => {
        // Change isOnline to false 
        // Emit user-offline
      })
    });
  })  
  .catch((error) => console.log(error));
