const express = require('express');
const flash = require('connect-flash');
const app = express();
// const expressWinston = require('express-winston');
// const winston = require('winston');
const routes = require('./routes');
const bodyParser = require('body-parser');
const compression = require('compression');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

let url = 'mongodb://35.243.148.136:27017/th';
const dbUrl = process.env.DB_URL;

if (process.env.DB_URL) {
  url = dbUrl;
}

mongoose.connect(url, {
  useNewUrlParser: true,
});

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'TuringHutOnlineJudge',
  saveUninitialized: true,
  resave: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.user) {
    res.locals.name = req.user.name;
    res.locals.rollno = req.user.username;
  }
  res.locals.login = req.isAuthenticated();
  next();
});


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
app.set('view engine', 'ejs');
app.enable('jsonp callback');
app.use(express.static('./public'));
app.use(express.static('./node_modules'));
app.use(flash());

app.listen(8080, () => {
  console.log('server stated on port 8080');
});
