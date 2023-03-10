const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required.'
    },
    email: {
        type: String,
        required: 'This field is required.'
    },
    IG: {
        type: String,
        required: false
    },
    subscribed: {
        type: Boolean,
        default: true
    },
    reason: {
        type: String,
        required: false
    }
});

subscriberSchema.set('timestamps', true)

module.exports = mongoose.model('subscriber', subscriberSchema);