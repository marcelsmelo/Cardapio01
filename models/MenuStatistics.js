const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MenuStatisticsSchema = new Schema({
  companyID: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  date: {type: String,required: true},
  count: {type: Number, required: true, default: 1}
});

MenuStatisticsSchema.plugin(require('./plugins/timestamp.js'));


module.exports = mongoose.model('MenuStatistics', MenuStatisticsSchema);
