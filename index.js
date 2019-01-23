var express = require('express');
var flash = require('connect-flash');
var app = express();
var expressWinston = require('express-winston');
var winston = require('winston');
var routes = require('./routes');
var bodyParser = require('body-parser');
var compression = require('compression');

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(expressWinston.logger({
//     transports: [
//         new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     )
// }));

// app.set('showStackError', true);
// app.locals.pretty = true;

app.use(routes);

app.use(compression());

// app.use(expressWinston.errorLogger({
//     transports: [
//         new winston.transports.Console()
//     ],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     )
// }));

// app.use(express.errorLogger({
//     dumpExceptions: true,
//     showStack: true
// }));

// app.use(express.static('./public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.enable("jsonp callback");
app.use(express.static('./public'));
app.use(flash());

app.listen(8080, () => {
    console.log('server stated on port 8080')
})