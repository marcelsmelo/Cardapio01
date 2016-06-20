const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategoryStatisticsSchema = new Schema({
  companyID: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  date: require('./fields/required-field.js')('String'),
  count: require('./fields/required-default-field.js')('Number', 1)
});

CategoryStatisticsSchema.plugin(require('./plugins/timestamp.js'));


module.exports = mongoose.model('CategoryStatistics', CategoryStatisticsSchema);
