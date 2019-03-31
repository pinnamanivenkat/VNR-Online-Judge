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
  submissionTime: {
    type: Date,
    required: true
  },
  contestCode: {
    type: String,
  },
});

const Submission = module.exports = mongoose
  .model('Submission', SubmissionSchema);

module.exports.createSubmission = function (dbData, callback) {
  Submission.create(dbData, function (err, data) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(undefined, data);
    }
  });
};

module.exports.getSubmissionDetails = function (submissionId, callback) {
  Submission.findById(submissionId, (err, doc) => {
    callback(err, doc);
  });
}

module.exports.getContestSubmissions = function (contestId,username, callback) {
  Submission.find({
    username: username,
    contestCode: contestId
  },null,{sort: {
    submissionTime: -1
  }}, (err, data) => {
    callback(err, data);
  });
}

module.exports.updateScore = function (submissionId, score) {
  Submission.findById(submissionId,(err,docs) => {
    if(!err && docs) {
      docs.score = score;
      docs.save();
    }
  })
}