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

module.exports.createContest = function (contestData) {
    console.log(contestData);
    ContestScore.create(contestData, (err, docs) => {});
};

module.exports.updateScore = function (userScore) {
    ContestScore.findOne({
        "_id": userScore._id
    }, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            if(res.userScore.length==0) {
                var dataObject = {
                    username: userScore.username
                };
                dataObject[userScore.problemCode] = userScore.score
                console.log(dataObject);
            } else {
                // TODO: update score if user has already submitted, createScore if user hasn't submitted
                console.log(res.userScore[userScore.problemCode]);
            }
        }
    });
}