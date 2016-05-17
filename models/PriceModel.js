var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PriceSchema = new Schema({
      size: {type: String, required: true},
      price: {type: Number, required: true}
});

PriceSchema.plugin(require('./plugins/timestamp.js'));

module.exports =  PriceSchema;
