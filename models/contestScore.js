const mongoose = require('mongoose');

const ContestScoreSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    userScore: {
        type: Array,
        required: true
    },
});

const ContestScore = module.exports = mongoose.model('ContestScore', ContestScoreSchema);

module.exports.createContest = function (contestData) {
    ContestScore.create(contestData, (err, docs) => {});
};

module.exports.getContestScores = function(contestId,callback) {
    ContestScore.findOne({
        _id: contestId
    },(err,docs) => {
        callback(err,docs);
    });
}

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
                dataObject[userScore.problemCode] = userScore.score;
                dataObject.lastSubmission = userScore.submissionTime;
                res.userScore.push(dataObject);
                res.save();
            } else {
                for(var i=0;i<res.userScore.length;i++) {
                    if(res.userScore[i].username == userScore.username) {
                        if(res.userScore[i][userScore.problemCode]<userScore.score) {
                            res.userScore[i][userScore.problemCode] = userScore.score;
                            res.userScore[i].lastSubmission = userScore.submissionTime;
                            res.markModified("userScore");
                        }
                        break;
                    }
                }
                res.save();
            }
        }
    });
}