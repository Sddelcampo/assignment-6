"use strict";
const db = require('./db-conn');

class JokeBookModel {
    static getCategories() {
        const stmt = db.prepare('SELECT name FROM categories');
        return stmt.all();
    }

    static getJokesByCategory(category, limit = null) {
        const stmt = db.prepare(`
            SELECT jokes.setup, jokes.delivery 
            FROM jokes
            JOIN categories ON jokes.category_id = categories.id
            WHERE categories.name = ?
            ${limit ? 'LIMIT ?' : ''}
        `);
        return limit ? stmt.all(category, limit) : stmt.all(category);
    }

    static addJoke(category, setup, delivery) {
        const categoryStmt = db.prepare('SELECT id FROM categories WHERE name = ?');
        const categoryRow = categoryStmt.get(category);

        if (!categoryRow) {
            throw new Error('Invalid category');
        }

        const insertStmt = db.prepare('INSERT INTO jokes (setup, delivery, category_id) VALUES (?, ?, ?)');
        insertStmt.run(setup, delivery, categoryRow.id);

        return this.getJokesByCategory(category);
    }
}

module.exports = JokeBookModel;
