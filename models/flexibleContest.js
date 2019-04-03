const mongoose = require('mongoose');

const FlexibleContestSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    contestSubmissionTime: {
        type: Object,
        required: true
    }
});

const FlexibleContest = module.exports = mongoose.model('FlexibleContest', FlexibleContestSchema);

module.exports.insertContestDetails = function(contestCode) {
    FlexibleContest.create({
        _id: contestCode,
        contestSubmissionTime: {}
    });
}

module.exports.startContestForUser = function(username,contestCode,callback) {
    FlexibleContest.findById(contestCode,(err,docs)=>{
        if(!err && docs) {
            if(!docs.contestSubmissionTime) {
                docs.contestSubmissionTime = {};
            }
            docs.contestSubmissionTime[username] = new Date();
            callback(err,{});
        } else {
            callback(err,undefined);
        }
        docs.save();
    });
};

module.exports.getUserContestDetails = function (username, contestCode, callback) {
    FlexibleContest.findById(contestCode, (err, docs) => {
        if (!err && docs) {
            if (docs.contestSubmissionTime && docs.contestSubmissionTime[username]) {
                callback(err,docs.contestSubmissionTime[username]);
            } else {
                callback(err,undefined);
            }
        } else {
            callback(err, undefined);
        }
    });
};