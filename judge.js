var Queue = require('bull');
var processor = require('./processor');

const redisAuth = {
    host: "35.243.148.136",
    port: "6379"  
};

var numWorkers = 5;

var queue = new Queue('execute',{
    'redis': redisAuth
});

module.exports.execute = function (data) {
    queue.add(data);
}

queue.process(5,processor);