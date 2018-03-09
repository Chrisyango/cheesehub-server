'use strict';

const mongoose = require('mongoose');

const CheeseSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  }
});

CheeseSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.name
  };
};

const Cheese = mongoose.model('Cheese', CheeseSchema);

module.exports = Cheese;