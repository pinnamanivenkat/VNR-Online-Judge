const mongoose = require('mongoose');

const ContestSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  contestname: {
    type: String,
    required: true,
  },
  startdate: {
    type: Date,
    required: true,
  },
  enddate: {
    type: Date,
    required: true,
  },
  problems: {
    type: Array,
    required: true,
  },
  contesttype: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
});

const Contest = module.exports = mongoose.model('Contest', ContestSchema);

module.exports.createContest = function(contestData, callback) {
  Contest.create(contestData, (err, docs)=>{
    callback(err);
  });
};

module.exports.getContestDetails = function(contestId, callback) {
  Contest.findOne({
    _id: contestId,
  }, function(error, docs) {
    callback(error, docs);
  });
};
