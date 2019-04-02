const mongoose = require('mongoose');

const FlexibleContestSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    contestSubmissionTime: {
        type: Array,
        required: true
    },
});

const FlexibleContest = module.exports = mongoose.model('FlexibleContest', FlexibleContestSchema);

module.exports.getUserContestDetails = function(username,contestCode,callback) {
    FlexibleContest.findById(contestCode,(err,docs) => {
        var foundKey = false;
        for(var i=0;i<docs.contestSubmissionTime.length;i++) {
            var element = docs.contestSubmissionTime[i];
            if(element.username == username) {
                foundKey = true;
                callback(err,docs.contestSubmissionTime[i]);
                break;
            }
        }
        if(foundKey) {
            callback(err,undefined)
        }
    });
};