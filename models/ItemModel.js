const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Price = require('./PriceModel.js');

const ItemSchema = new Schema({
    categoryID: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    name: require('./fields/required-field.js')('String'),
    description: require('./fields/field.js')('String'),
    status: require('./fields/required-default-field.js')('Boolean', true),
    position: require('./fields/required-field.js')('Number'),
    prices: [Price]
});

ItemSchema.plugin(require('./plugins/timestamp.js'));

module.exports =  mongoose.model('Item', ItemSchema);
