const Category = require('../models/category');
const Joke = require('../models/joke');

const getCategories = (req, res) => {
    Category.getAll((err, categories) => {
        if (err) {
            res.status(500).json({ error: 'Failed to retrieve categories' });
        } else {
            res.json(categories);
        }
    });
};

const getJokesByCategory = (req, res) => {
    const { category } = req.params;
    const { limit } = req.query;
    
    Category.getByName(category, (err, categoryData) => {
        if (err || !categoryData) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        Joke.getByCategory(categoryData.id, limit, (err, jokes) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to retrieve jokes' });
            }
            res.json(jokes);
        });
    });
};

const addNewJoke = (req, res) => {
    const { category, setup, delivery } = req.body;
    
    if (!category || !setup || !delivery) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    Category.getByName(category, (err, categoryData) => {
        if (err || !categoryData) {
            return res.status(404).json({ error: 'Category not found' });
        }

        Joke.addNew(categoryData.id, setup, delivery, (err, jokeId) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to add new joke' });
            }

            Joke.getByCategory(categoryData.id, 10, (err, jokes) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to retrieve jokes' });
                }
                res.json(jokes);
            });
        });
    });
};

module.exports = {
    getCategories,
    getJokesByCategory,
    addNewJoke
};
