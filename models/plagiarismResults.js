const mongoose = require('mongoose');

const PlagiarismScheme = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    resultsUrl: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }
});

const PlagiarismResult = module.exports = mongoose.model('PlagiarismResult', PlagiarismScheme);

module.exports.insertPlagiarismResult = function (dbData) {
    PlagiarismResult.updateOne({
        _id: dbData._id
    }, dbData, {
        upsert: true
    }, function (err, data) {});
};

module.exports.findMyPlagiarismResults = function(username,callback) {
    PlagiarismResult.find({
        username:username
    },(err,docs) => {
        callback(err,docs);
    })
}