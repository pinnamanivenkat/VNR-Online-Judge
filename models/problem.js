const mongoose = require('mongoose');

const ProblemSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  difficultyLevel: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
});

const Problem = module.exports = mongoose.model('Problem', ProblemSchema);

module.exports.getProblemData = function(problemCode, callback) {
  Problem.findOne({
    _id: problemCode,
  }, (err, res) => {
    callback(err, res);
  });
};

module.exports.getProblemsByUsername = function(username, callback) {
  Problem.find({
    username: username,
  }, function(err, docs) {
    callback(err, docs);
  });
};

module.exports.updateProblem = function(problemCode, newData, callback) {

};

module.exports.createProblem = function(dbData, callback) {
  Problem.create(dbData, function(err, newObject) {
    if (err) {
      callback(err);
    } else {
      callback(undefined);
    }
  });
};

module.exports.deleteProblem = function(problemCode,callback) {
  Problem.deleteOne({
    _id:problemCode
  },(err) => {
    callback(err);
  })
}