mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');


var TagSchema = new mongoose.Schema({
    name: {type: String, required: [true, 'Tag name is required']},
    members: {type: Array},
    createdAt: {type: Date, required: [true, 'CreatedAt is required']},
    creator: {type: String, required: [true, 'Creator is required']},
    editedAt: {type: Date, required: [true, 'EditedAt is required']},
});

autoIncrement.initialize(mongoose);

TagSchema.plugin(autoIncrement.plugin, 'tag');

var Tag = mongoose.model('tag', TagSchema);

module.exports = Tag;