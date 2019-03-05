module.exports.compileFile = function(filePath,language,callback) {
    let compileCmd = "";
    if(language == 'c') {
        compileCmd = "gcc -o test ";
    } else if(language == 'java') {
        compileCmd = "javac ";
    } else if(language == 'cpp') {
        compileCmd = "g++ -o test ";
    }
    compileCmd+=filePath;
    console.log(compileCmd);
}