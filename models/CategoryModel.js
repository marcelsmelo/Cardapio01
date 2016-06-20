const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Item = require('./ItemModel.js');;

const CategorySchema = new Schema({
  companyID: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: require('./fields/required-field.js')('String'),
  status: require('./fields/required-default-field.js')('Boolean', true),
  position: require('./fields/required-field.js')('Number'),
});

CategorySchema.plugin(require('./plugins/timestamp.js'));


module.exports = mongoose.model('Category', CategorySchema);
