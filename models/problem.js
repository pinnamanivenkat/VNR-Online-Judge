var mongoose = require('mongoose');

var ProblemSchema = mongoose.Schema({
    problemCode: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true
    },
    difficultyLevel: {
        type: String,
        required: true
    },
});