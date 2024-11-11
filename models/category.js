"use strict";
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./jokebook.db');

const Category = {
    getAll: function(callback) {
        db.all('SELECT * FROM categories', [], callback);
    },
    getByName: function(name, callback) {
        db.get('SELECT * FROM categories WHERE name = ?', [name], callback);
    }
};

module.exports = Category;
