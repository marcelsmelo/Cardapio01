var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MenuSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  cardapio: {
    type: Schema.Types.Mixed
  }
});

module.exports = mongoose.model('Menu', MenuSchema);
