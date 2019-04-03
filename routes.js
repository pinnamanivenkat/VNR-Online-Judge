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
var judge = require('./judge');
var os = require('os');
var childProcess = require('child_process');

const contestStatus = {};

const User = require('./models/user');
const Problem = require('./models/problem');
const Submission = require('./models/submission');
const Contest = require('./models/contest');
const ContestScore = require('./models/contestScore');
const PlagiarismResults = require('./models/plagiarismResults');
const FlexibleContests = require('./models/flexibleContest');

var homeDir = os.homedir();
var plagiarismPath = path.join(homeDir, '.plagiarism');

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
  data.redirect = '/';
  res.send(data);
});

router.get('/createUser', isAdmin, (req, res) => {
  res.render('createUser');
});

router.post('/createUser', isAdmin, function (req, res) {
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
  userConfig.userType = req.body.addUserType;
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
  User.comparePassword(req.body.oldPassword, req.user.password,
    function (err, isMatch) {
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
    res.render('myproblems', {
      problems: docs,
    });
  });
});

router.get('/problems', (req, res) => {
  Problem.getAllProblems((docs) => {
    res.render('viewProblems', {
      problems: docs
    });
  });
});

router.get('/question', isAdmin, (req, res) => {
  if (req.query.problemCode) {
    Problem.getProblemData(req.query.problemCode, (err, problemData) => {
      if (err || problemData.username != req.user.username) {
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
  var submissionTime = new Date();
  const submissionObject = {
    username: req.user.username,
    problemCode: req.body.problemCode,
    language: req.body.language,
    score: 0,
    contestCode: "practice",
    submissionTime
  };
  createSubmission(req, res, submissionObject);
});

router.post('/submit/:contestId/:questionId', isLoggedIn, (req, res) => {
  const temp = contestStatus[req.params.contestId+"___"+req.user.username];
  var submissionTime = new Date();
  if (temp == 'running') {
    const submissionObject = {
      username: req.user.username,
      problemCode: req.params.questionId,
      language: req.body.language,
      score: 0,
      contestCode: req.params.contestId,
      submissionTime
    };
    createSubmission(req, res, submissionObject);
  } else {
    res.sendStatus(404);
  }
});

/**
 * [createSubmission description]
 * @param  {[type]} req              [description]
 * @param  {[type]} res              [description]
 * @param  {[type]} submissionObject [description]
 */
function createSubmission(req, res, submissionObject) {
  Submission.createSubmission(submissionObject, (err, data) => {
    if (err) {
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
        username: submissionObject.username,
        language: req.body.language,
        problemCode: req.body.problemCode,
        contestCode: submissionObject.contestCode,
        submissionTime: submissionObject.submissionTime
      });
      res.send({
        status: 200,
        submissionCode: data._id,
      });
    }
  });
}

router.get(['/viewSolution/:submissionCode', '/contest/:contestId/viewSolution/:submissionCode'], (req, res) => {
  res.render('viewSolution');
});

router.post('/contest/:contestId/viewSolution/:submissionCode', (req, res) => {
  getSubmissionDetails(req.params.contestId, req.params.submissionCode, res);
});

router.post('/viewSolution/:submissionCode', (req, res) => {
  getSubmissionDetails('practice', req.params.submissionCode, res);
});

function getSubmissionDetails(contestId, submissionId, res) {
  Submission.getSubmissionDetails(submissionId, (err, doc) => {
    var status, code, submissionStatus;
    if (err || !doc) {
      status = 400;
    } else {
      if (doc.contestCode == contestId) {
        status = 200;
        var submissionCode = path.join(__dirname, "submissions", '_' + submissionId, '_' + submissionId + '.' + doc.language);
        var submissionStatusFile = path.join(__dirname, "submissions", '_' + submissionId, 'status.json');
        if (fs.existsSync(submissionCode)) {
          code = String(fs.readFileSync(submissionCode));
          if (fs.existsSync(submissionStatusFile)) {
            submissionStatus = JSON.parse(String(fs.readFileSync(submissionStatusFile)));
            status = 200;
          } else {
            status = 320;
          }
        } else {
          status = 320;
        }
      } else {
        status = 400;
      }
    }
    res.send({
      status,
      code,
      submissionStatus
    });
  });
}

router.get('/problem/:questionId', (req, res) => {
  Problem.getProblemData(req.params.questionId, (err, problemData) => {
    if (err) {
      res.send(404);
    } else {
      // TODO: handle when problem Doesn't exist
      // TODO: add feature of problem visibility
      const problemPath = path.join(__dirname, 'problem', problemData._id);
      // TODO: Make problem visible
      if (fs.existsSync(problemPath)) {
        const description = fs.readFileSync(path.join(problemPath,
          'description.txt'));
        res.render('problem', {
          description,
          problemCode: req.params.questionId,
          duringContest: false,
          contestCode: "practice"
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
      file.path = path.join(type, name);
    }
  });
  form.on('field', function (name, value) {
    if (!issueCreating) {
      if (name == 'questionCode') {
        problemPath = path.join(problemPath, value);
        questionPath = problemPath;
        if (fs.existsSync(problemPath)) {
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
        problemConfig['visible'] = value;
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

router.post('/deleteProblem', isAdmin, (req, res) => {
  Problem.getProblemData(req.body.problemCode, (err, docs) => {
    if (err) {
      res.send({
        status: 400
      });
    } else {
      if (docs.username == req.user.username) {
        Problem.deleteProblem(req.body.problemCode, (err) => {
          if (err) {
            res.send({
              status: 400
            });
          } else {
            problemPath = path.join(__dirname, "problem", req.body.problemCode);
            fsExtra.remove(problemPath, (err) => {
              if (err) {
                res.send({
                  status: 400
                });
              } else {
                res.send({
                  status: 200
                });
              }
            });
          }
        })
      } else {
        res.send({
          status: 404
        });
      }
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
    res.render('createContest', {
      problems,
    });
  });
});

router.put('/createContest', isAdmin, (req, res) => {
  for (const key in req.body) {
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
      ContestScore.createContest({
        _id: req.body.contestUrl,
        userScore: []
      });
      FlexibleContests.insertContestDetails(req.body.contestUrl);
      res.send({
        status: 200,
        message: 'Contest created, redirecting to contest page',
      });
    }
  });
});

router.get('/contests', (req, res) => {
  Contest.getAllContests((err, docs) => {
    var contests = getContestDetails(docs);
    res.render('contests', {
      contests
    });
  });
});

router.get('/myContests', isAdmin, (req, res) => {
  Contest.getMyContests(req.user.username, (err, docs) => {
    var contests = getContestDetails(docs);
    res.render('contests', {
      contests
    });
  })
});

function getContestDetails(docs) {
  var contests = [];
  docs.forEach(doc => {
    doc.contestStatus = getContestStatus(doc.startdate, doc.enddate);
    if (doc.contesttype == 'fixedtime') {
      doc.contestDuration = Number((Math.abs(doc.startdate.getTime() - doc.enddate.getTime()) / 3600000).toFixed(2)) + ' hrs';
    } else {
      doc.contestDuration = doc.duration + ' hrs';
    }
    contests.push(doc);
  });
  return contests;
}

router.get('/contest/:contestId', (req, res) => {
  Contest.getContestDetails(req.params.contestId, (err, data) => {
    if (err || !data) {
      res.sendStatus(404);
    } else {
      const dataObject = JSON.parse(JSON.stringify(data));
      if (data.contesttype == 'flexibletime') {
        if (req.isAuthenticated()) {
          getFlexibleContestStatus(req.params.contestId, req.user.username, data.startdate, data.enddate, data.duration, function (status, userStartDate, userEndDate) {
            dataObject['startdate'] = userStartDate;
            dataObject['enddate'] = userEndDate;
            dataObject['contestStatus'] = status;
            contestStatus[data._id+"___"+req.user.username] = dataObject['contestStatus'];
            res.render('contest', {
              dataObject,
            });
          });
        } else {
          res.redirect('/login');
        }
      } else {
        dataObject['contestStatus'] = getContestStatus(data.startdate, data.enddate);
        contestStatus[data._id+"___"+req.user.username] = dataObject['contestStatus'];
        res.render('contest', {
          dataObject,
        });
      }
    }
  });
});

router.post('/startContest/:contestId', isLoggedIn, (req, res) => {
  FlexibleContests.startContestForUser(req.user.username, req.params.contestId, (err, response) => {
    if (!err && response) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });
});

function getFlexibleContestStatus(contestCode, username, start, end, duration, callback) {
  var presentDate = new Date();
  var startdate = new Date(start);
  var enddate = new Date(end);
  if (presentDate > enddate) {
    callback('ended');
  } else if (presentDate < startdate) {
    callback('notstarted');
  } else {
    FlexibleContests.getUserContestDetails(username, contestCode, (err, docs) => {
      if (!err && docs) {
        var userStartDate = new Date(docs);
        var userEndDate = userStartDate;
        userEndDate.setHours(userEndDate.getHours() + duration);
        if (presentDate < userEndDate) {
          callback('running', userStartDate, userEndDate);
        } else {
          console.log('ended');
          callback('ended');
        }
      } else {
        callback('usernotstarted');
      }
    })
  }
}

router.get('/mySubmissions/:contestId', isLoggedIn, (req, res) => {
  Contest.getContestDetails(req.params.contestId, (err, data) => {
    if (err || !data) {
      res.sendStatus(404);
    } else {
      var contestStatus = getContestStatus(data.startdate, data.enddate);
      if (contestStatus != "notstarted") {
        Submission.getContestSubmissions(req.params.contestId, req.user.username, (err, data) => {
          if (err || !data) {
            res.sendStatus(404);
          } else {
            res.render('mySubmissions', {
              data
            });
          }
        });
      } else {
        res.sendStatus(404);
      }
    }
  });
});

function getContestStatus(start, end) {
  const presentDate = new Date();
  const startdate = (new Date(start));
  const enddate = (new Date(end));
  if (presentDate < startdate) {
    return 'notstarted'
  } else if (presentDate > enddate) {
    return 'ended';
  } else {
    return 'running';
  }
}

router.get('/contest/:contestId/problem/:questionId', (req, res) => {
  if (contestStatus[req.params.contestId+"___"+req.user.username] != 'notstarted') {
    Problem.getProblemData(req.params.questionId, (err, problemData) => {
      if (err) {
        res.sendStatus(404);
      } else {
        const problemPath = path.join(__dirname, 'problem', problemData._id);
        if (fs.existsSync(problemPath)) {
          const description = fs.readFileSync(path.join(problemPath,
            'description.txt'));
          res.render('problem', {
            description,
            problemCode: req.params.questionId,
            duringContest: true,
            contestCode: req.params.contestId,
          });
        } else {
          res.sendStatus(404);
        }
      }
    });
  } else {
    res.sendStatus(404);
  }
});

router.get('/contest/ranks/:contestId', (req, res) => {
  ContestScore.getContestScores(req.params.contestId, (err, contestScore) => {
    if (err) {
      res.sendStatus(400);
    } else {
      var userScores = [];
      contestScore.userScore.forEach(element => {
        let userScore = 0;
        for (var key in element) {
          if (key != "username" && key != "lastSubmission") {
            userScore += element[key];
          }
        }
        userScores.push({
          username: element["username"],
          score: userScore,
          lastSubmission: element["lastSubmission"]
        });
      });
      userScores = sortByKey(userScores, 'score', true);
      var tempArr = [],
        tempUserScores = [];
      for (var i = 0; i < userScores.length; i++) {
        tempArr.push(userScores[i]);
        if (!((i + 1) < userScores.length && userScores[i + 1].score === userScores[i].score)) {
          sortByKey(tempArr, 'lastSubmission', false);
          tempUserScores.push(...tempArr);
          tempArr = [];
        }
      }
      userScores = tempUserScores;
      res.render('ranks', {
        userScores
      })
    }
  });
});

router.get('/runPlagiarizer/:contestId', isAdmin, (req, res) => {
  Submission.getContestSubmissions(req.params.contestId, (err, data) => {
    if (err || !data) {
      res.send({
        status: 404
      });
    } else {
      var contestPlagiarism = path.join(plagiarismPath, req.params.contestId);
      data.forEach(submissionObject => {
        var newPath = path.join(contestPlagiarism, submissionObject.username + '_' + submissionObject._id);
        if (!fs.existsSync(newPath)) {
          fsExtra.mkdirp(newPath);
        }
        var submissionPath = path.join(__dirname, 'submissions', '_' + submissionObject._id, '_' + submissionObject._id + '.' + submissionObject.language);
        fs.copyFileSync(submissionPath, newPath);
      });
      var pc = childProcess.spawn('./moss -l cc ' + newPath + "/*");
      pc.stderr.on('data', (data) => {

        pc.kill();
      });
      pc.stdout.on('data', (data) => {
        PlagiarismResults.insertPlagiarismResult({
          _id: req.params.contestId,
          resultsUrl: data,
          username: req.user.username
        });
        pc.kill();
      });
      pc.on('close', (code, signal) => {})
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

function sortByKey(array, key, descending) {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    if (descending) {
      if (x < y) {
        return 1;
      } else if (x > y) {
        return -1;
      } else {
        return 0;
      }
    } else {
      if (x > y) {
        return 1;
      } else if (x < y) {
        return -1;
      } else {
        return 0;
      }
    }
  });
}

module.exports = router;