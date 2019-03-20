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
    console.log(userScore);
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
                res.userScore.push(dataObject);
                res.save();
                console.log(dataObject);
            } else {
                for(var i=0;i<res.userScore.length;i++) {
                    if(res.userScore[i].username == userScore.username) {
                        res.userScore[i][userScore.problemCode] = userScore.score;
                        res.markModified("userScore");
                        break;
                    }
                }
                res.save();
            }
        }
    });
}