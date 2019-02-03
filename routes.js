var express = require('express');
var mongoose = require('mongoose');
var url = require('url');
var router = express.Router();
var passport = require('passport');
var LocalStratey = require('passport-local').Strategy;
var generatePassword = require('generate-password');
var fileUtils = require('./fileUtils');

var User = require('./models/user');


passport.use(new LocalStratey((username, password, done) => {
    User.getUserByUsername(username, function (err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            return done(null, false, {
                message: 'Unknown User'
            });
        }
        User.comparePassword(password, user.password, function (err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Invalid password'
                });
            }
        });
    })
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local'), function (req, res) {
    var data = {
        username: req.user.username,
        name: req.user.name,
    }
    if (req.user.userType == "user") {
        data.redirect = '/';
    } else {
        data.redirect = '/adminPortal';
    }
    res.send(data);
});

router.post('/createUser', function (req, res) {
    let userConfig = {
        _id: req.body.username,
        username: req.body.username,
        password: generatePassword.generate({
            length: 10,
            numbers: true,
            uppercase: true,
            strict: true
        }),
        name: req.body.name,
    }
    if (req.body.addUserType) {
        userConfig.userType = "admin";
    } else {
        userConfig.userType = "user";
    }
    var newUser = new User(userConfig);
    User.createUser(newUser, function (password, err) {
        if (err) {
            res.send(err);
        } else {
            res.send({
                password,
                created: true
            })
        }
    });
});

router.get('/changePassword', function (req, res) {
    res.render('changepassword');
});

router.post('/changePassword', (req, res) => {
    User.comparePassword(req.body.oldPassword, req.user.password, function (err, isMatch) {
        let status = 433,
            message = "";
        if (err) {
            message = "Please login again";
        } else if (isMatch) {
            let username = req.user._id,
                password = req.body.newPassword;
            status = 1881;
            User.changePassword(username, password, (err, status) => {
                if (err) {
                    status = 433;
                    message = "Please login again";
                } else {
                    status = 1881;
                }
                res.send({
                    status,
                    message
                })
            });
        } else {
            message = "Please enter correct password";
        }
        if (status == 433) {
            res.send({
                status,
                message
            });
        }
    });
});

router.get('/adminPortal', isAdmin, (req, res) => {
    res.render('adminPortal');
});

router.get('/myProblems', isAdmin, (req, res) => {
    fileUtils.findProblemsByUsername(req.user.username, (err, data) => {
        let dataToSend = "";
        if (err) {
            dataToSend = {};
        } else {
            dataToSend = data;
        }
        res.render('myproblems', dataToSend)
    });
});

router.get('/question', isAdmin, (req, res) => {
    res.render("question");
})

router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

router.get('/contest', (req, res) => {
    res.sendStatus(200);
});

router.get('/user', function (req, res) {
    res.send(req.user);
});

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.userType == "admin") {
        return next();
    }
    res.status(400).json({
        'message': 'access denied'
    })
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.status(400).json({
        'message': 'access denied'
    });
}

module.exports = router;