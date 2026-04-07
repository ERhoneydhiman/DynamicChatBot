const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const WebsiteSchema = new mongoose.Schema({
    website_id: {
        type: String,
        default: () => uuidv4(),
        unique: true,
        index: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Website', WebsiteSchema);
