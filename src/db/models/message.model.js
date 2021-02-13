const  mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    content: { type: String, require: true, trim: true},
    date: { type: Date, default: new Date()}
});


module.exports = mongoose.model('Message', messageSchema);
