const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MenuStatisticsSchema = new Schema({
  companyID: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  date: require('./fields/required-field.js')('String'),
  count: require('./fields/required-default-field.js')('Number', 1)
});

MenuStatisticsSchema.plugin(require('./plugins/timestamp.js'));


module.exports = mongoose.model('MenuStatistics', MenuStatisticsSchema);
