const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    name: require('./fields/required-field.js')('String'),
    email: require('./fields/required-field.js')('String', 'isEmail'),
    subject: require('./fields/required-field.js')('String'),
	message: require('./fields/required-field.js')('String'),
});

ContactSchema.plugin(require('./plugins/timestamp.js'));

module.exports = mongoose.model('Contact', ContactSchema);
