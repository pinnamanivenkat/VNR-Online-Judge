var mongoose = require('mongoose');

var ContestSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    contestname: {
        type: String,
        required: true
    },
    startdate: {
        type: Date,
        required: true
    },
    enddate: {
        type: Date,
        required: true
    },
    problems: {
        type: Array,
        required: true
    },
    contesttype: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    }
});

var Contest = module.exports = mongoose.model('Contest', ContestSchema);

module.exports.createContest = function(contestData,callback) {
    
};