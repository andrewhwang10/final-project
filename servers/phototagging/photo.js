mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');


var PhotoSchema = new mongoose.Schema({
    url: {type: String, required: [true, 'URL is required']},
    originalPhotoName: {type: String, required: [true, 'originalPhotoName is required']},
    createdAt: {type: Date, required: [true, 'CreatedAt is required']},
    creator: {type: String, required: [true, 'Creator is required']},
    editedAt: {type: Date, required: [true, 'EditedAt is required']},
});

autoIncrement.initialize(mongoose);

PhotoSchema.plugin(autoIncrement.plugin, 'Photo');

var Photo = mongoose.model('Photo', PhotoSchema);

module.exports = Photo;