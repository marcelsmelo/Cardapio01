var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PriceSchema = new Schema({
      size: require('./fields/required-field.js')('String'),
      price: require('./fields/required-field.js')('Number'),
});

PriceSchema.plugin(require('./plugins/timestamp.js'));

module.exports =  PriceSchema;
