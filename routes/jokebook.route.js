"use strict";
const express = require('express');
const router = express.Router();
const JokeBookController = require('../controllers/jokebook.controller');

router.get('/categories', JokeBookController.getCategories);
router.get('/joke/:category', JokeBookController.getJokes);
router.post('/joke/new', JokeBookController.addJoke);

module.exports = router;
