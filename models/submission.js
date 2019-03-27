const mongoose = require('mongoose');

const SubmissionSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  problemCode: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  contestCode: {
    type: String,
  },
});

const Submission = module.exports = mongoose
    .model('Submission', SubmissionSchema);

module.exports.createSubmission = function(dbData, callback) {
  Submission.create(dbData, function(err, data) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(undefined, data);
    }
  });
};

module.exports.getSubmissionDetails = function(submissionId,callback) {
  Submission.findById(submissionId,(err,doc) => {
    callback(err,doc);
  });
}