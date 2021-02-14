const  mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    content: { type: String, require: true, trim: true},
    date: { type: Date, default: new Date()},
    author: { type: Schema.ObjectId, ref: "User"},
    read: {type: Boolean, default: false},
    video: {type: String, trim: true}
});


module.exports = mongoose.model('Message', messageSchema);
