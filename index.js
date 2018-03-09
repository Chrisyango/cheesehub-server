'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const {PORT, CLIENT_ORIGIN, DATABASE_URL} = require('./config');
const {dbConnect} = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

const Cheese = require('./models/cheese');
const seedData = require('./db/cheeses.json');

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/cheeses', (req, res, next) => {
  Cheese.find()
    .then(cheeses => {
      res.json(cheeses.map(cheese => {
        return cheese.serialize();
      }));
    })
    .catch(next);
});

// app.post('/api/cheeses', (req, res, next) => {
//   const {name} = req.body;
//   const newCheese = {name};

//   if (!name) {
//     const err = new Error('Missing `name` in request body');
//     err.status = 400;
//     return next(err);
//   }

//   Cheese.create(newCheese)
//     .then(cheese => {
//       res.status(201)
//         .location(`${req.originalUrl}/${cheese.id}`)
//         .json(cheese);
//     })
//     .catch(err => next(err));
// });

// For inserting Data ===================================
mongoose.connect(DATABASE_URL)
  .then(() => {
    return mongoose.connection.db.dropDatabase()
      .then(result => {
        console.info(`Dropped Database: ${result}`);
      });
  })
  .then(() => {
    return Cheese.insertMany(seedData)
      .then(results => {
        console.info(`Inserted ${results.length} Cheeses`);
      });
  });


function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = {app};