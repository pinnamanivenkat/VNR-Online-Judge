var fs = require('fs');
var path = require('path');

module.exports.findProblemsByUsername = function (username, callback) {
    let userPath = path.join(__dirname, "problems", username);
    if (fs.existsSync(userPath)) {
        callback(undefined, {});
    } else {
        callback({
            "errMsg": "No problems authored by" + username
        });
    }
};