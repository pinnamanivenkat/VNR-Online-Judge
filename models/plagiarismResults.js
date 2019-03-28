const mongoose = require('mongoose');

const PlagiarismScheme = mongoose.Schema({
    _id: {
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

const PlagiarismResult = module.exports = mongoose.model('PlagiarismResult',PlagiarismScheme);

module.exports.insertPlagiarismResult = function(dbData,callback) {
    PlagiarismResult.create(docs,function(err,data) {});
};