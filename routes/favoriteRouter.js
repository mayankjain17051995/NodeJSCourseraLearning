const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const Favorites = require('../models/favorites');
var authenticate = require('../authenticate');
const cors = require('./cors');
const Dishes = require("../models/dishes");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route("/")
.options(cors.corsWithOptions, (req, res) => { 
    res.sendStatus(200);
 })
 .get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user:req.user._id})
    .then((favorites) => {
        if (favorites === null) {
            var err = new Error('There are no dishes in your favorites right now');
            err.status = 404;
            return next(err);
        } else {
            Favorites.findById(favorites._id)
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favorites);
            })
        }
        
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user:req.user._id})
    .then((favorites) => {
    if (favorites === null) {
        Favorites.create({
            user: req.user._id,
            dishes: []
        })
        .then((favorites) => {          
            var pushDishes = [];
            var pushDishesFinal = [];
            for (var key in req.body) {
                if (req.body.hasOwnProperty(key)) {
                    pushDishes.push(req.body[key]._id);
                }
            }
            Dishes.find({})
            .then((dishes) => {
                for (var i = 0; i < dishes.length; i++) {
                    if (pushDishes.indexOf(dishes[i]._id.toString()) !== -1) {
                        if (favorites.dishes.indexOf(dishes[i]._id.toString()) === -1) {
                            pushDishesFinal.push(dishes[i]._id.toString());
                        }
                    }
                    if (i === dishes.length - 1) {
                        favorites.dishes.push(...pushDishesFinal);
                        favorites.save()
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type','application/json');
                            res.json(favorites);
                        })
                    }
                }
            })
        })
    } else {
        var pushDishes = [];
        var pushDishesFinal = [];
        for (var key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                pushDishes.push(req.body[key]._id);
            }
        }
        Dishes.find({})
        .then((dishes) => {
            for (var i = 0; i < dishes.length; i++) {
                if (pushDishes.indexOf(dishes[i]._id.toString()) !== -1) {
                    if (favorites.dishes.indexOf(dishes[i]._id.toString()) === -1) {
                        pushDishesFinal.push(dishes[i]._id.toString());
                    }
                }
                if (i === dishes.length - 1) {
                    favorites.dishes.push(...pushDishesFinal);
                    favorites.save()
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(favorites);
                    })
                }
            }
        })
    }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user:req.user._id})
    .populate('dishes')
    .then((favorites) => {
    if (favorites === null) {
        var err = new Error('There are no dishes in your favourite list.');
        err.status = 404;
        return next(err);
    } else {
        if (favorites.dishes.length > 0) {
            favorites.dishes.splice(0);
            favorites.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favorite);
            },(err) => next(err))
        } else {
            var err = new Error('There are no dishes in your favourite list.');
            err.status = 404;
            return next(err);
        }
    }
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route("/:dishId")
.options(cors.corsWithOptions, (req, res) => { 
    res.sendStatus(200);
 })
 .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+ req.params.dishId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
 .post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
     Dishes.findById(req.params.dishId)
     .then((dish) => {
        if (dish === null) {
            var err = new Error('Dish not found');
            err.status = 404;
            return next(err);
        } else {
            Favorites.findOne({user:req.user._id})
            .then((favorites) => {
                if (favorites === null) {
                    Favorites.create({
                        user: req.user._id,
                        dishes: [req.params.dishId]
                    })
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(favorites);
                    })
                } else {
                    if (favorites.dishes.indexOf(req.params.dishId) !== -1) {
                        var err = new Error('Dish already present in favourite dishes');
                        err.status = 404;
                        return next(err);
                    } else {
                        favorites.dishes.push(req.params.dishId)
                        favorites.save()
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type','application/json');
                            res.json(favorites);
                        })
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user:req.user._id})
    .then((favorites) => {
    if (favorites === null) {
        var err = new Error('There are no dishes in your favourite list.');
        err.status = 404;
        return next(err);
    } else {
        if (favorites.dishes.indexOf(req.params.dishId) !== -1) {
            let index = favorites.dishes.indexOf(req.params.dishId);
            favorites.dishes.splice(index, 1);
            favorites.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favorite);
            },(err) => next(err))
        } else {
            var err = new Error('Dish not in your favourite dishes');
            err.status = 404;
            return next(err);
        }
    }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;