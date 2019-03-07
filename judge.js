var kue = require('kue');
var path = require('path');
var fs = require('fs');
const {
    c,
    cpp,
    node,
    python,
    java
} = require('compile-run');
var queue = kue.createQueue({
    redis: {
        host: "34.73.94.204"
    }
});

queue.watchStuckJobs();

module.exports.execute = function (data) {
    console.log('sample');
    queue.create('execute', JSON.stringify(data)).removeOnComplete(true).attempts(3).save();
}

queue.process('execute', 5, (job, done) => {
    console.log('execute');
    job.data = JSON.parse(job.data);
    console.log(job.data);
    if (job.data.language == 'c') {
        executeCode(c, job.data);
    } else if (job.data.language == 'cpp') {
        executeCode(cpp, job.data);
    } else if (job.data.language == 'java') {
        executeCode(java, job.data);
    } else {
        executeCode(python, job.data);
    }
    done();
});

function executeCode(executor,data) {
    console.log(data.problemCode);
    let problemPath = path.join(__dirname,"problem",data.problemCode);
    let inputPath = path.join(problemPath,"input");
    fs.readdirSync(inputPath).forEach(file => {
        let inputFile = path.join(inputPath,file);
        console.log(executor);
        executor.runFile(data.submissionPath,{
            stdin: fs.readFileSync(inputFile)
        },(err,result) => {
            if(err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
        console.log(file);
    })
}

kue.app.listen(3000);