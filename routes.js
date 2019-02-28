var express = require('express');
var mongoose = require('mongoose');
var url = require('url');
var router = express.Router();
var passport = require('passport');
var LocalStratey = require('passport-local').Strategy;
var generatePassword = require('generate-password');
const formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var fsExtra = require('fs-extra');

var User = require('./models/user'),
    Problem = require('./models/problem'),
    Submission = require('./models/submission');

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
    Problem.getProblemsByUsername(req.user.username, (err, docs) => {
        console.log(docs);
        res.render('myproblems', {
            problems: docs
        });
    });
});

router.get('/question', isAdmin, (req, res) => {
    if (req.query.problemCode) {
        Problem.getProblemDfata(req.query.problemCode, (err, problemData) => {
            if (err || problemData.author != req.user.username) {
                res.status(400).json({
                    'message': 'access denied'
                })
            } else {
                res.render("createQuestion", {
                    "method": "update"
                });
            }
        })
    } else {
        res.render("createQuestion", {
            "method": "create"
        });
    }
});

router.post('/submit/:questionId', isLoggedIn, (req, res) => {
    // TODO: submit only when problem is visible
    var submissionObject = {
        username: req.user.username,
        problemCode: req.body.problemCode,
        status: "UEX",
        score: 0
    };
    console.log(submissionObject);
    Submission.createSubmission(submissionObject, (err, data) => {
        console.log(data);
        if (err) {
            res.send({
                status: 400
            })
        } else {
            let submissionPath = path.join(__dirname,"submissions","_"+data._id+"."+req.body.language);
            fs.writeFileSync(submissionPath,req.body.code);
            // TODO: Create submission queue and insert submission
            res.send({
                status: 200,
                submissionCode: data._id
            })
        }
    });
});

router.get('/viewsolution/:submissionCode', (req, res) => {
    // TODO: Render submission page which should contain status,score,code
});

router.get('/problem/:questionId', (req, res) => {
    console.log(req.params.questionId);
    Problem.getProblemData(req.params.questionId, (err, problemData) => {
        if (err) {
            res.send(404);
        } else {
            // TODO: add feature of problem visibility
            var problemPath = path.join(__dirname, 'problem', problemData._id);
            if (fs.existsSync(problemPath)) {
                var description = fs.readFileSync(path.join(problemPath, "description.txt"));
                res.render("problem", {
                    description,
                    problemCode: req.params.questionId
                });
            } else {
                res.sendStatus(404);
            }
        }
    });
})

router.post('/createProblem', (req, res) => {
    var problemConfig = {};
    var form = formidable.IncomingForm();
    form.parse(req);
    let issueCreating = false;
    var problemPath = path.join(__dirname, "problem");
    var questionPath;
    if (!fs.existsSync(problemPath)) {
        fs.mkdirSync(problemPath);
    }
    var inputPath, outputPath;
    form.on('fileBegin', function (name, file) {
        if (!issueCreating) {
            var type;
            if (name[0] == 'i') {
                type = inputPath;
            } else {
                type = outputPath;
            }
            console.log(type + " " + name);
            file.path = path.join(type, name);
        }
    });
    form.on('field', function (name, value) {
        if (!issueCreating) {
            if (name == "questionCode") {
                problemPath = path.join(problemPath, value);
                questionPath = problemPath;
                console.log(problemPath);
                if (fs.existsSync(problemPath)) {
                    console.log('sample')
                    res.send({
                        status: 400,
                        message: "Problem with same code exist"
                    });
                    issueCreating = true;
                } else {
                    problemConfig["_id"] = value;
                    problemConfig["author"] = req.user.name;
                    problemConfig["username"] = req.user.username;
                    inputPath = path.join(problemPath, "input");
                    outputPath = path.join(problemPath, "output");
                    fs.mkdirSync(problemPath);
                    fs.mkdirSync(inputPath);
                    fs.mkdirSync(outputPath);
                }
            } else if (name == "questionText") {
                questionDescriptionPath = path.join(problemPath, 'description.txt');
                fs.writeFileSync(questionDescriptionPath, value);
            } else if (name == "difficultyLevel") {
                problemConfig["difficultyLevel"] = value;
            }
        }
    });
    form.on(['error', 'aborted'], function () {
        fsExtra.removeSync(questionPath);
        res.send({
            status: 400
        })
    });
    form.on('end', function () {
        if (!issueCreating) {
            //Save the problem
            Problem.createProblem(problemConfig, (err) => {
                console.log(err);
                if (err) {
                    fsExtra.removeSync(questionPath);
                    res.send({
                        status: 400,
                        message: "Some error occured, Please try again"
                    });
                } else {
                    res.send({
                        status: 200
                    });
                }
            });
        }
    })
});

router.post('/updateProblem', isAdmin, (req, res) => {
    Problem.getProblemData(req.body.problemCode, (err, problemData) => {
        if (err || problemData.author != req.user.username) {
            res.status(400).json({
                'message': 'access denied'
            })
        } else {
            //Update Problem
        }
    })
});

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