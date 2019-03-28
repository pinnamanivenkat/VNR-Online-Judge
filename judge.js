var bull = require('bull');
var path = require('path');
var fs = require('fs');
var ContestScore = require('./models/contestScore');
var Submission = require('./models/submission');
const {
    c,
    cpp,
    node,
    python,
    java
} = require('./compile-run');

var queue = new bull('execute', {
    redis: {
        host: "35.243.148.136",
        port: "6379"
    }
});

module.exports.execute = function (data) {
    queue.add(data);
}

queue.process((job, done) => {
    if (job.data.language == 'c') {
        executeCode(c, job.data, done);
    } else if (job.data.language == 'cpp') {
        executeCode(cpp, job.data, done);
    } else if (job.data.language == 'java') {
        executeCode(java, job.data, done);
    } else {
        executeCode(python, job.data, done);
    }
});

function executeCode(executor, data, done) {
    let problemPath = path.join(__dirname, "problem", data.problemCode);
    let inputPath = path.join(problemPath, "input");
    let outputPath = path.join(problemPath, "output");
    executionResult = {
        message : "",
        status: []
    };
    var counter = 0,testCase = 0;
    score = 0;
    files = fs.readdirSync(inputPath)
    files.forEach(file => {
        let inputFile = path.join(inputPath, file);
        let outputFile = path.join(outputPath, "output_"+(counter++));
        let input = fs.readFileSync(inputFile).toString();
        let output = fs.readFileSync(outputFile).toString();
        executor.runFile(data.submissionFile, {
            stdin: input,
            timeout: 1000
        }, (err, result) => {
            testCase++;
            if (err) {
                console.log(err);
            } else {
                if (result.errorType) {
                    if (result.errorType == 'compile-time') {
                        executionResult.status.push({
                            status: "CTE"
                        });
                        var error = result.stderr;
                        var regex = new RegExp(path.join(__dirname,'submissions'),'g');
                        executionResult.message = error.replace(regex,'');
                    } else {
                        executionResult.status.push({
                            status: "RTE"
                        });
                    }
                } else {
                    if (result.stdout == output) {
                        executionResult.status.push({
                            status: "AC"
                        });
                        score++;
                    } else {
                        executionResult.status.push({
                            status: "WA"
                        });
                    }
                }
            }
            if(testCase == files.length) {
                fs.writeFileSync(path.join(data.submissionPath, "status.json"), JSON.stringify(executionResult));
                Submission.updateScore(data.submissionId,score);
                if(data.contestCode != 'practice') {
                    ContestScore.updateScore({
                        _id: data.contestCode,
                        username: data.username,
                        problemCode: data.problemCode,
                        score,
                        submissionTime: data.submissionTime
                    });
                }
            }
        });
    });
    done();
}