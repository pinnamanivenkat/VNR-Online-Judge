const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const passport = require('passport');
const LocalStratey = require('passport-local').Strategy;
const generatePassword = require('generate-password');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
let judge;
// var judge = require('./judge')

const User = require('./models/user');
const Problem = require('./models/problem');
const Submission = require('./models/submission');
const Contest = require('./models/contest');

passport.use(new LocalStratey((username, password, done) => {
    User.getUserByUsername(username, function (err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            return done(null, false, {
                message: 'Unknown User',
            });
        }
        User.comparePassword(password, user.password, function (err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Invalid password',
                });
            }
        });
    });
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
    const data = {
        username: req.user.username,
        name: req.user.name,
    };
    if (req.user.userType == 'user') {
        data.redirect = '/';
    } else {
        data.redirect = '/adminPortal';
    }
    res.send(data);
});

router.get('/createUser', (req, res) => {
    res.render('createUser');
});

router.post('/createUser', function (req, res) {
    const userConfig = {
        _id: req.body.username,
        username: req.body.username,
        password: generatePassword.generate({
            length: 10,
            numbers: true,
            uppercase: true,
            strict: true,
        }),
        name: req.body.name,
    };
    if (req.body.addUserType) {
        userConfig.userType = 'admin';
    } else {
        userConfig.userType = 'user';
    }
    const newUser = new User(userConfig);
    User.createUser(newUser, function (password, err) {
        if (err) {
            res.send(err);
        } else {
            res.send({
                password,
                created: true,
            });
        }
    });
});

router.get('/changePassword', function (req, res) {
    res.render('changepassword');
});

router.post('/changePassword', (req, res) => {
    User.comparePassword(req.body.oldPassword, req.user.password, function (err, isMatch) {
        let status = 433;
        let message = '';
        if (err) {
            message = 'Please login again';
        } else if (isMatch) {
            const username = req.user._id;
            const password = req.body.newPassword;
            status = 1881;
            User.changePassword(username, password, (err, status) => {
                if (err) {
                    status = 433;
                    message = 'Please login again';
                } else {
                    status = 1881;
                }
                res.send({
                    status,
                    message,
                });
            });
        } else {
            message = 'Please enter correct password';
        }
        if (status == 433) {
            res.send({
                status,
                message,
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
            problems: docs,
        });
    });
});

router.get('/question', isAdmin, (req, res) => {
    if (req.query.problemCode) {
        Problem.getProblemDfata(req.query.problemCode, (err, problemData) => {
            if (err || problemData.author != req.user.username) {
                res.status(400).json({
                    'message': 'access denied',
                });
            } else {
                res.render('createQuestion', {
                    'method': 'update',
                });
            }
        });
    } else {
        res.render('createQuestion', {
            'method': 'create',
        });
    }
});

router.post('/submit/:questionId', isLoggedIn, (req, res) => {
    // TODO: submit only when problem is visible
    const submissionObject = {
        username: req.user.username,
        problemCode: req.body.problemCode,
        status: 'UEX',
        score: 0,
    };
    console.log(submissionObject);
    Submission.createSubmission(submissionObject, (err, data) => {
        console.log(data);
        if (err) {
            console.log(err);
            res.send({
                status: 400,
            });
        } else {
            let submissionPath = path.join(__dirname, 'submissions');
            if (!fs.existsSync(submissionPath)) {
                fs.mkdirSync(submissionPath);
            }
            submissionPath = path.join(submissionPath, '_' + data._id);
            if (!fs.existsSync(submissionPath)) {
                fs.mkdirSync(submissionPath);
            }
            submissionFile = path.join(submissionPath, '_' + data._id + '.' + req.body.language);
            fs.writeFileSync(submissionFile, req.body.code);
            judge.execute({
                submissionPath,
                submissionFile,
                submissionId: data._id,
                language: req.body.language,
                problemCode: req.body.problemCode,
            });
            // TODO: Create submission queue and insert submission
            res.send({
                status: 200,
                submissionCode: data._id,
            });
        }
    });
});

router.get('/viewsolution/:submissionCode', (req, res) => {
    res.render('viewSolution');
    // TODO: Render submission page which should contain status,score,code
});

router.get('/problem/:questionId', (req, res) => {
    console.log(req.params.questionId);
    Problem.getProblemData(req.params.questionId, (err, problemData) => {
        if (err) {
            res.send(404);
        } else {
            // TODO: add feature of problem visibility
            const problemPath = path.join(__dirname, 'problem', problemData._id);
            // TODO: Make problem visible
            if (fs.existsSync(problemPath)) {
                const description = fs.readFileSync(path.join(problemPath, 'description.txt'));
                res.render('problem', {
                    description,
                    problemCode: req.params.questionId,
                });
            } else {
                res.sendStatus(404);
            }
        }
    });
});

router.post('/createProblem', (req, res) => {
    const problemConfig = {};
    const form = formidable.IncomingForm();
    form.parse(req);
    let issueCreating = false;
    let problemPath = path.join(__dirname, 'problem');
    let questionPath;
    if (!fs.existsSync(problemPath)) {
        fs.mkdirSync(problemPath);
    }
    let inputPath;
    let outputPath;
    form.on('fileBegin', function (name, file) {
        if (!issueCreating) {
            let type;
            if (name[0] == 'i') {
                type = inputPath;
            } else {
                type = outputPath;
            }
            console.log(type + ' ' + name);
            file.path = path.join(type, name);
        }
    });
    form.on('field', function (name, value) {
        if (!issueCreating) {
            console.log(name + ' ' + value);
            if (name == 'questionCode') {
                problemPath = path.join(problemPath, value);
                questionPath = problemPath;
                console.log(problemPath);
                if (fs.existsSync(problemPath)) {
                    console.log('sample');
                    res.send({
                        status: 400,
                        message: 'Problem with same code exist',
                    });
                    issueCreating = true;
                } else {
                    problemConfig['_id'] = value;
                    problemConfig['author'] = req.user.name;
                    problemConfig['username'] = req.user.username;
                    inputPath = path.join(problemPath, 'input');
                    outputPath = path.join(problemPath, 'output');
                    fs.mkdirSync(problemPath);
                    fs.mkdirSync(inputPath);
                    fs.mkdirSync(outputPath);
                }
            } else if (name == 'questionText') {
                questionDescriptionPath = path.join(problemPath, 'description.txt');
                fs.writeFileSync(questionDescriptionPath, value);
            } else if (name == 'difficultyLevel') {
                problemConfig['difficultyLevel'] = value;
            } else if (name == 'visiblility') {
                problemConfig['visible'] = (value == 'true');
                console.log(name + ' ' + value);
            }
        }
    });
    form.on(['error', 'aborted'], function () {
        fsExtra.removeSync(questionPath);
        res.send({
            status: 400,
        });
    });
    form.on('end', function () {
        if (!issueCreating) {
            // Save the problem
            Problem.createProblem(problemConfig, (err) => {
                console.log(err);
                if (err) {
                    fsExtra.removeSync(questionPath);
                    res.send({
                        status: 400,
                        message: 'Some error occured, Please try again',
                    });
                } else {
                    res.send({
                        status: 200,
                    });
                }
            });
        }
    });
});

router.post('/updateProblem', isAdmin, (req, res) => {
    // TODO: update Problem
    Problem.getProblemData(req.body.problemCode, (err, problemData) => {
        if (err || problemData.author != req.user.username) {
            res.status(400).json({
                'message': 'access denied',
            });
        } else {
            // Update Problem
        }
    });
});

router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

router.get('/createContest', isAdmin, (req, res) => {
    Problem.getProblemsByUsername(req.user.username, (err, docs) => {
        let problems = [];
        if (!err) {
            problems = docs;
        }
        console.log(problems);
        res.render('createContest', {
            problems,
        });
    });
});

router.put('/createContest', isAdmin, (req, res) => {
    for (var key in req.body) {
        req.body = JSON.parse(key);
        break;
    }
    const contestData = {
        _id: req.body.contestUrl,
        username: req.user.username,
        contestname: req.body.contestName,
        startdate: req.body.startdate,
        enddate: req.body.enddate,
        problems: req.body.problems,
        contesttype: req.body.contestType,
        duration: req.body.contestDuration,
    };
    Contest.createContest(contestData, function (err) {
        if (err) {
            res.send({
                status: 400,
                message: err,
            });
        } else {
            res.send({
                status: 200,
                message: 'Contest created, redirecting to contest page',
            });
        }
    });
});

router.get('/contest/:contestId', (req, res) => {
    Contest.getContestDetails(req.params.contestId, (err, data) => {
        if (err || !data) {
            res.sendStatus(404);
        } else {
            const dataObject = JSON.parse(JSON.stringify(data));
            const presentDate = new Date();
            const startdate = (new Date(data.startdate));
            const enddate = (new Date(data.enddate));
            if (presentDate < startdate) {
                console.log('not started');
                dataObject['contestStatus'] = 'notstarted';
            } else if (presentDate > enddate) {
                console.log('ended');
                dataObject['contestStatus'] = 'ended';
            } else {
                console.log('running');
                dataObject['contestStatus'] = 'running';
            }
            console.log(dataObject);
            res.render('contest', {
                dataObject,
            });
        }
    });
});

router.get('/user', function (req, res) {
    res.send(req.user);
});

/**
 * [isAdmin description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {Boolean}       [description]
 */
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.userType == 'admin') {
        return next();
    }
    res.status(400).json({
        'message': 'access denied',
    });
}

/**
 * [isLoggedIn description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {Boolean}       [description]
 */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(400).json({
        'message': 'access denied',
    });
}

module.exports = router;
