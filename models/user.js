var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs')

var UserSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        required: true,
        type: String
    },
    name: {
        required: true,
        type: String
    },
    userType: {
        required: true,
        type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserByUsername = function (username, callback) {
    var query = {
        username: username
    };
    User.findOne(query, callback);
}

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) {
            throw err;
        }
        callback(null, isMatch);
    });
}

module.exports.changePassword = function (username, password, callback) {
    this.getUserByUsername(username, function (err, user) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    console.log(err);
                    callback(err);
                }
                bcrypt.hash(password, salt, null, function (err, hash) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                    console.log(user);
                    user.password = hash;
                    User.findOneAndUpdate({
                        _id: username
                    }, user, (err, res) => {
                        if (err) {
                            console.log(err);
                            callback(err);
                        } else {
                            callback(undefined, res);
                        }
                    })
                });
            });
        }
    })
};

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, null, function (err, hash) {
            var password = newUser.password;
            newUser.password = hash;
            User.create(newUser, function (err, doc) {
                if (err) {
                    password = undefined;
                }
                callback(password, err);
            });
        });
    });
}