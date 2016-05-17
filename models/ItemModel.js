const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Price = require('./PriceModel.js');

const ItemSchema = new Schema({
    categoryID: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    name: {type: String, required: true},
    description: {type: String},
    prices: [Price]
});

ItemSchema.plugin(require('./plugins/timestamp.js'));

module.exports =  mongoose.model('Item', ItemSchema);
