const mongoose = require('mongoose');

const ContestScoreSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    userScore: {
        type: Array,
        required: true
    }
});

const ContestScore = module.exports = mongoose.model('ContestScore', ContestScoreSchema);

module.exports.createContest = function (contestData, callback) {
    ContestScore.create(contestData, (err, docs) => {
        callback(err);
    });
};

module.exports.updateScore = function(userScore,callback) {
    // ContestScore.find({_id: userScore.contestCode},function(err,doc) {
    //     console.log(doc);
    // });
}