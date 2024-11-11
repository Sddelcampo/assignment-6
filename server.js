// Import dependencies
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

// Initialize the app and database
const app = express();
const db = new sqlite3.Database('./jokebook.db'); // SQLite database file

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set up the views directory
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//implementation of example categegories and jokes
let categories = ['funnyJoke', 'lameJoke'];
let funnyJokeList = [
    { 'setup': 'Why did the student eat his homework?', 'delivery': 'Because the teacher told him it was a piece of cake!' },
    { 'setup': 'What kind of tree fits in your hand?', 'delivery': 'A palm tree' },
    { 'setup': 'What is worse than raining cats and dogs?', 'delivery': 'Hailing taxis' }
];
let lameJokeList = [
    { 'setup': 'Which bear is the most condescending?', 'delivery': 'Pan-DUH' },
    { 'setup': 'What would the Terminator be called in his retirement?', 'delivery': 'The Exterminator' }
];

// Initialize database and insert initial data if it doesn't exist
db.serialize(() => {
    // Create categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);
    
    // Create jokes table
    db.run(`CREATE TABLE IF NOT EXISTS jokes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        setup TEXT NOT NULL,
        delivery TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
    )`);

    // Insert categories if not already present
    categories.forEach(categoryName => {
        db.get('SELECT * FROM categories WHERE name = ?', [categoryName], (err, row) => {
            if (!row) {
                db.run('INSERT INTO categories (name) VALUES (?)', [categoryName]);
            }
        });
    });

    // Insert jokes for each category
    categories.forEach(categoryName => {
        db.get('SELECT * FROM categories WHERE name = ?', [categoryName], (err, categoryRow) => {
            if (categoryRow) {
                const jokes = categoryName === 'funnyJoke' ? funnyJokeList : lameJokeList;
                jokes.forEach(joke => {
                    db.run('INSERT INTO jokes (category_id, setup, delivery) VALUES (?, ?, ?)', [categoryRow.id, joke.setup, joke.delivery], function(err) {
                        if (err) console.error(err.message);
                        console.log(`Inserted joke: ${joke.setup}`);
                    });
                });
            }
        });
    });
});

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));


// Routes

// Landing page - Display a random joke from the database
app.get('/', (req, res) => {
    db.get('SELECT * FROM jokes ORDER BY RANDOM() LIMIT 1', (err, joke) => {
        if (err) {
            return res.status(500).send('Error fetching random joke');
        }
        res.render('index', { joke: joke });
    });
});

// GET endpoint for categories
app.get('/jokebook/categories', (req, res) => {
    db.all('SELECT * FROM categories', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const categoriesList = rows.map(row => row.name); // Get category names
        res.render('categories', { categories: categoriesList });
    });
});

/// GET endpoint for jokes in a category
app.get('/jokebook/joke/:category', (req, res) => {
    const category = req.params.category;
    const limit = req.query.limit || 10; // Default limit to 10 if not specified

    db.get('SELECT * FROM categories WHERE name = ?', [category], (err, categoryRow) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!categoryRow) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Fetch jokes for the given category
        db.all('SELECT setup, delivery FROM jokes WHERE category_id = ? LIMIT ?', [categoryRow.id, limit], (err, jokes) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // If no jokes are found, pass a message
            const message = jokes.length === 0 ? 'No jokes are available, try and make some!' : null;

            // Render the view with the jokes (or message)
            res.render('category_jokes', { 
                category: category,
                jokes: jokes.length > 0 ? jokes : null, // Pass jokes if available, else null
                message: message  // Always pass the message variable
            });
        });
    });
});


// POST endpoint to add a new joke
app.post('/jokebook/joke/new', (req, res) => {
    const { category, setup, delivery } = req.body;  // Destructure to get the form fields

    // Check if all fields are provided
    if (!category || !setup || !delivery) {
        return res.status(400).json({ error: 'Missing required fields: category, setup, and delivery' });
    }

    // First, check if the category exists
    db.get('SELECT * FROM categories WHERE name = ?', [category], (err, categoryRow) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // If the category does not exist, create it
        if (!categoryRow) {
            // Insert the new category into the database
            db.run('INSERT INTO categories (name) VALUES (?)', [category], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Get the newly created category
                const newCategoryId = this.lastID; // lastID gives the id of the newly inserted row

                // Insert the new joke into the jokes table
                db.run('INSERT INTO jokes (category_id, setup, delivery) VALUES (?, ?, ?)', [newCategoryId, setup, delivery], function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    // Fetch jokes for the newly created category
                    db.all('SELECT setup, delivery FROM jokes WHERE category_id = ?', [newCategoryId], (err, jokes) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        // If no jokes exist, set a message
                        const message = jokes.length === 0 ? 'No jokes are available, try and make some!' : null;

                        // Render the category jokes view with the updated joke list
                        res.render('category_jokes', { 
                            category: category, 
                            jokes: jokes.length > 0 ? jokes : null, 
                            message: message  // Ensure the message is passed here
                        });
                    });
                });
            });
        } else {
            // If the category exists, just insert the joke
            const categoryId = categoryRow.id;

            db.run('INSERT INTO jokes (category_id, setup, delivery) VALUES (?, ?, ?)', [categoryId, setup, delivery], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Fetch jokes for the given category
                db.all('SELECT setup, delivery FROM jokes WHERE category_id = ?', [categoryId], (err, jokes) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    // If no jokes exist, set a message
                    const message = jokes.length === 0 ? 'No jokes are available, try and make some!' : null;

                    // Render the category jokes view with the updated joke list
                    res.render('category_jokes', { 
                        category: categoryRow.name, 
                        jokes: jokes.length > 0 ? jokes : null, 
                        message: message  // Ensure the message is passed here
                    });
                });
            });
        }
    });
});

// Set up the server to listen on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
