var mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs');

var ProblemSchema = mongoose.Schema({
    _id: {
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

var Problem = module.exports = mongoose.model('Problem', ProblemSchema);

module.exports.getProblemData = function (problemCode, callback) {
    Problem.findOne({
        _id: problemCode
    }, (err, res) => {
        if (err) {
            callback(err);
        }
        callback(undefined, res);
    })
};

module.exports.getProblemsByAuthor = function (author, callback) {

};

module.exports.updateProblem = function (problemCode, newData, callback) {

};

module.exports.createProblem = function (problemData, callback) {
    var dbData = {
        _id: problemData.problemCode,
        author: problemData.author,
        difficultyLevel: problemData.difficultyLevel
    };
    Problem.create(dbData, function (err, newObject) {
        if (err) {
            callback(err);
        } else {
            var userDirectory = path.join(__dirname, "problems", problemData.author);
            if (!fs.existsSync(userDirectory)) {
                fs.mkdirSync(userDirectory);
            }
            var userProblemDirectory = path.join(userDirectory, dbData.author);
            fs.mkdirSync(userProblemDirectory);
            fs.writeFileSync(path.join(userProblemDirectory, dbData.problemCode), problemData.problemDescription);
            // Write the test cases
        }
    });
};