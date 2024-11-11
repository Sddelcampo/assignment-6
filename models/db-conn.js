"use strict";
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'demo.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jokes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setup TEXT NOT NULL,
        delivery TEXT NOT NULL,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories (id)
    );
`);

// Function to initialize the categories
const initializeCategories = () => {
    const categories = ['funnyJoke', 'lameJoke'];
    const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
    categories.forEach(category => insertCategory.run(category));
};

// Initialize categories on startup
initializeCategories();

module.exports = db;
