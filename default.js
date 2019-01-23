var caseRegEx = /[ 	]*case (([a-zA-Z0-9_])+|([^']([a-zA-Z0-9+_ 	*&^%$#@!~])+[^'])|([^"]([a-zA-Z0-9+_ 	*&^%$#@!~])+[^"]))+:([ 	{])*/g;
var defaultRegEx = /default[ 	]*:[ 	{]*/g;
var fs = require('fs');
var readline = require('readline');
console.log('Please provide path of java file');
var hasEncounteredDefault = false;

var inputReader = readline.createInterface({
    input: process.stdin
});

inputReader.on('line', function (inputPath) {
    readFile(inputPath.toString());
    inputReader.close();
});

function readFile(inputPath) {
    if (fs.existsSync(inputPath)) {
        var reader = readline.createInterface({
            input: fs.createReadStream(inputPath)
        });
        reader.on('line',function(line) {
            if(line.match(caseRegEx)) {
                if(hasEncounteredDefault) {
                    console.log("Encountered default before case")
                    process.exit();
                }
            } else if(line.match(defaultRegEx)) {
                hasEncounteredDefault = true;
            }
        })
        reader.on('close',function() {
            console.log("Switch case is properly structured");
        })
    }
}