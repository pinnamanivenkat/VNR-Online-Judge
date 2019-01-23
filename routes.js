var express = require('express');
var url = require('url');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    console.log('sample')
    res.redirect(200,url.format({
        pathname: "/contest",
        query: {
            login: true,
        }
    }));
});

router.get('/contest', (req, res) => {
    console.log(req.query.login);
    if(req.query.login) {
        res.render('contest');
    } else {
        res.render('index');
    }
})

module.exports = router;