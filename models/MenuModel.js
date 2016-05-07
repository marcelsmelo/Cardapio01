var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MenuSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categorias: {
    type: Array
  }
}, {strict: false});

module.exports = mongoose.model('Menu', MenuSchema);
