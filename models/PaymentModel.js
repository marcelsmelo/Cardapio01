const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    companyID: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    service: require('./fields/required-field.js')('String'),
    infoType: require('./fields/required-field.js')('String'),
    data :require('./fields/required-field.js')('Mixed')
});

PaymentSchema.plugin(require('./plugins/timestamp.js'));

module.exports = mongoose.model('Payment', PaymentSchema);
