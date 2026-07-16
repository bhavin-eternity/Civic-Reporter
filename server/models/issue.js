const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, },
    description: { type: String, required: true, trim: true, },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
        address: {
            type: String,
            required: true,
        },

    },
    category: {
        type: String,
        enum: [
            'road',
            'garbage',
            'water',
            "electricity",
            "traffic",
            "other",
        ],
        required: true,
    },

    photo: { type: String },

    status: {
        type: String,
        enum: ["open", "in_progress", "resolved", "closed"],
        default: "open",
    },
    upvotes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},
    { timestamps: true })

issueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("Issue", issueSchema)