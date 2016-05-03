const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Price = require('./PriceModel.js');

const ItemSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String},
    prices: [Price]
});

module.exports =  ItemSchema;
