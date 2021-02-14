const  mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
   name: { type: String, require: true, trim: true, unique: true},
    online: {type: Boolean, default: false},
    // readMessages: [{type: Schema.ObjectId, ref: "Message"}]
});


module.exports = mongoose.model('User', userSchema);
