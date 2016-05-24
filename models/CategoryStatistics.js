const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategoryStatisticsSchema = new Schema({
  companyID: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  date: {type: String,required: true},
  count: {type: Number, required: true, default: 1}
});

CategoryStatisticsSchema.plugin(require('./plugins/timestamp.js'));


module.exports = mongoose.model('CategoryStatistics', CategoryStatisticsSchema);
