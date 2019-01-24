var express = require('express');
var mongoose = require('mongoose');
var url = require('url');
var router = express.Router();
var passport = require('passport');
var LocalStratey = require('passport-local').Strategy;
var generatePassword = require('generate-password');

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
                delete user.password;
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
    console.log(req.session);
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local'), function (req, res) {
    res.send(req.user);
});

router.post('/createUser', function (req, res) {
    var newUser = new User({
        _id: req.body.username,
        username: req.body.username,
        password: generatePassword.generate({
            length: 10,
            numbers: true,
            symbols: true,
            uppercase: true,
            strict: true
        }),
        name: req.body.name
    });
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

router.get('/logout', function (req, res) {
    req.logout();
    res.sendStatus(null)
});

router.get('/contest', (req, res) => {
    console.log(req);
    res.sendStatus(200);
});

router.get('/user', function (req, res) {
    res.send(req.user);
});

module.exports = router;