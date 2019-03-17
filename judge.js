var bull = require('bull');
var path = require('path');
var fs = require('fs');
const {
    c,
    cpp,
    node,
    python,
    java
} = require('compile-run');

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
    console.log(data.problemCode);
    let problemPath = path.join(__dirname, "problem", data.problemCode);
    let inputPath = path.join(problemPath, "input");
    let outputPath = path.join(problemPath, "output");
    executionResult = [];
    var counter = 0;
    fs.readdirSync(inputPath).forEach(file => {
        let inputFile = path.join(inputPath, file);
        let outputFile = path.join(outputPath, "output_"+(counter++));
        let input = fs.readFileSync(inputFile).toString();
        let output = fs.readFileSync(outputFile).toString();
        executor.runFile(data.submissionFile, {
            stdin: input,
            timeout: 1000
        }, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                if (result.errorType) {
                    if (result.errorType == 'compile-time') {
                        executionResult.push({
                            status: "CTE"
                        });
                    } else {
                        executionResult.push({
                            status: "RTE"
                        });
                    }
                } else {
                    if (result.stdout == output) {
                        executionResult.push({
                            status: "AC"
                        })
                    }
                }
                console.log(result);
            }
            fs.writeFileSync(path.join(data.submissionPath, "status.json"), JSON.stringify(executionResult));
        });
        console.log(file);
    });
    done();
}