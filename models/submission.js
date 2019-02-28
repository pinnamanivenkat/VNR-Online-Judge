var mongoose = require('mongoose');

var SubmissionSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    problemCode: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true  
    },
    score: {
        type: Number,
        required: true
    },
});

var Submission = module.exports = mongoose.model('Submission', SubmissionSchema);

module.exports.createSubmission = function(dbData,callback) {
    Submission.create(dbData,function(err,data) {
        if(err) {
            console.log(err);
            callback(err);
        } else {
            callback(undefined,data);
        }
    });
};