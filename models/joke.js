const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./jokebook.db');

const Joke = {
    getByCategory: function(categoryId, limit, callback) {
        const sql = 'SELECT * FROM jokes WHERE category_id = ? LIMIT ?';
        db.all(sql, [categoryId, limit || 10], callback);
    },
    addNew: function(categoryId, setup, delivery, callback) {
        const sql = 'INSERT INTO jokes (category_id, setup, delivery) VALUES (?, ?, ?)';
        db.run(sql, [categoryId, setup, delivery], function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, this.lastID);
            }
        });
    }
};

module.exports = Joke;
