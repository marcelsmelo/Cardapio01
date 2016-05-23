const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Item = require('./ItemModel.js');;

const CategorySchema = new Schema({
  companyID: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {type: String,required: true},
  status: {type: Boolean, required: true, default: true},
  position: {type: Number, required: true},
});

CategorySchema.plugin(require('./plugins/timestamp.js'));


module.exports = mongoose.model('Category', CategorySchema);
