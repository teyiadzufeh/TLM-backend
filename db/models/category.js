const mongoose = require('mongoose');

const categorySchemma = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required.'
    },
    image: {
        type: String,
        required: 'This field is required.'
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: false
    }]
});

module.exports = mongoose.model('Category', categorySchemma);