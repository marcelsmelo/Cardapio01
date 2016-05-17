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
});

MenuSchema.plugin(require('./plugins/timestamp.js'));

module.exports = mongoose.model('Menu', MenuSchema);
