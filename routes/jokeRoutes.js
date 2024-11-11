"use strict";
const express = require('express');
const router = express.Router();
const jokeController = require('../controllers/jokeController');

// Get all categories
router.get('/categories', jokeController.getCategories);

// Get jokes by category
router.get('/joke/:category', jokeController.getJokesByCategory);

// Add a new joke
router.post('/joke/new', jokeController.addNewJoke);

module.exports = router;
