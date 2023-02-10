const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required.'
    },
    email: {
        type: String,
        required: 'This field is required.'
    },
    comment: {
        type: String,
        required: 'This field is required.'
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    replies: {
        type: Array,
        required: false
    }
});

module.exports = mongoose.model('Comment', commentSchema);