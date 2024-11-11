"use strict";
const JokeBookModel = require('../models/jokebook.model');

class JokeBookController {
    static getCategories(req, res) {
        try {
            const categories = JokeBookModel.getCategories();
            res.json(categories.map(c => c.name));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static getJokes(req, res) {
        const { category } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;

        try {
            const jokes = JokeBookModel.getJokesByCategory(category, limit);
            if (jokes.length === 0) {
                return res.status(404).json({ error: 'No jokes found for this category' });
            }
            res.json(jokes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static addJoke(req, res) {
        const { category, setup, delivery } = req.body;

        if (!category || !setup || !delivery) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        try {
            const updatedJokes = JokeBookModel.addJoke(category, setup, delivery);
            res.json(updatedJokes);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = JokeBookController;
