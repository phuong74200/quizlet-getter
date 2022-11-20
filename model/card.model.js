const mongoose = require('mongoose');

const CardSchema = mongoose.Schema({
    quizId: String,
    mediaId: String,
    media: [{
        type: String
    }]
})

module.exports = mongoose.model('Card', CardSchema);