var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
const { json } = require('express');
const cors = require('./cors');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  User.find()
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else if (user) {
      if (req.body.firstname) {
        user.firstname = req.body.firstname;
      }
      if (req.body.lastname) {
        user.lastname = req.body.lastname;
      }
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        } else {
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Registration Successful!'});
          });
        }
      });
    }
  });

  // User.findOne({username: req.body.username})
  // .then((user) => {
  //   if (user != null) {
  //     var err = new Error('User ' + req.body.username + ' alresy exists!');
  //     err.status = 403;
  //     next(err);
  //   } else {
  //     return User.create({
  //       username: req.body.username,
  //       password: req.body.password
  //     });
  //   }
  // }, (err) => next(err))
  // .then((user) => {
  //   res.statusCode = 200;
  //   res.setHeader('Content-Type', 'application/json');
  //   res.json({status: 'Registration Successful!', user: user});
  // }, (err) => next(err))
  // .catch((err) => next(err));
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});

  // if (!req.session.user) {
  //   var authHeader = req.headers.authorization;
  //   if (!authHeader) {
  //     var err = new Error('You are not authenticated');
  //     err.status = 401;
  //     res.setHeader('WWW-Authenticate', 'Basic');
  //     return next(err);
  //   }

  //   var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

  //   User.findOne({username: auth[0]})
  //   .then((user) => {
  //     if (user === null) {
  //       var err = new Error('User ' + username + ' does not exist!');
  //       err.status = 403;
  //       return next(err);
  //     } else if (user.password !== auth[1]) {
  //       var err = new Error('Your password is incorrect!');
  //       err.status = 403;
  //       return next(err);
  //     } else if (user.username === auth[0] && user.password === auth[1]) {
  //       req.session.user = 'authenticated';
  //       res.statusCode = 200;
  //       res.setHeader('Content-Type', 'text/plain');
  //       res.end('You are authenticated!');
  //     }
  //   }, (err) => next(err))
  //   .catch((err) => next(err));
  // } else {
  //   res.statusCode = 200;
  //   res.setHeader('Content-Type', 'text/plain');
  //   res.end('You are already authenticated!');
  // }
});

router.get('/logout', cors.corsWithOptions, (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
