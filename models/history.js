var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var historySchema = new Schema({
   term: String,
   when: {type: Date, default: Date.now}
});

var History = mongoose.model('History', historySchema);

module.exports = History;