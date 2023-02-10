const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required.'
    },
    blocks: {
        type: Array,
        required: 'This field is required.'
    },
    description: {
        type: String,
        required: 'This field is required.'
    },
    email: {
        type: String,
        required: 'This field is required.'
    },
    category: {
        type: mongoose.Schema.Types.String,
        ref: "Category",
        required: 'This field is required'
    },
    image: {
        type: String,
        required: 'This field is required.'
    },
    other_images: {
        type: Array,
        required: false
    },
    blockquotes: [{
        quote: {
            type: String,
            required: true
        },
        figcaption: {
            type: String,
            required: false
        },
    }],
    breakblock: {
        type: Number,
        required: 'This field is required.'
    },
    secondbb: {
        type: Number,
        required: false
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    postnum: {
        type: Number,
        required: 'This field is required'
    },
    featured: {
        type: Boolean,
        default: false
    }

});

blogPostSchema.set('timestamps', true)

module.exports = mongoose.model('Post', blogPostSchema);