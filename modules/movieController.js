var mysql = require('promise-mysql');
const uniqueString = require('unique-string');
var fs = require('fs');
var path = require('path');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    connectionLimit: 10,
    multipleStatements: true
});

var DB_NAME = 'movies_ratings';
var path = require('path');
module.exports = {
    createDB: () => {
        var dbCMD = `CREATE SCHEMA IF NOT EXISTS ${DB_NAME}`
        var tableCMD = `CREATE TABLE IF NOT EXISTS ${DB_NAME}.movies(
            id INT NOT NULL AUTO_INCREMENT,
            title VARCHAR(500) NOT NULL,
            year INT NULL,
            poster VARCHAR(500) NULL,
            rating FLOAT NULL,
            numOfVoters INT NOT NULL DEFAULT 0,
            PRIMARY KEY (id)
        )`;

        pool.getConnection()
            .then(con => con.query(dbCMD))
            .then(() => pool.getConnection())
            .then(con => con.query(tableCMD))
    },
    getAllMovies: async () => {
        return new Promise((resolve, reject) => {
            var sql = `SELECT * FROM ${DB_NAME}.movies`;
            pool.getConnection()
                .then(con => con.query(sql))
                .then(results => resolve(results))
        })
    },
    addMovie: async (movie, poster) => {
        if (typeof poster !== 'undefined') {
            var unique = uniqueString() + path.extname(poster.name);
            var myPath = path.join(__dirname, '..\\public/images\\' + unique);
            fs.writeFile(myPath, poster.data, function (err) {
                if (err) throw err;
                writeToDB()
            })
        } else {
            writeToDB()
        }

        const writeToDB = () => {
            return new Promise((resolve, reject) => {
                var sql = `INSERT INTO ${DB_NAME}.movies (title, year, poster, rating, numOfVoters) VALUES('${movie.title}', ${movie.year}, '${typeof unique !== 'undefined' ? unique : null}', ${typeof movie.rating !== 'undefined' ? movie.rating : null},(CASE WHEN rating IS NULL THEN numOfVoters ELSE numOfVoters + 1 END))`;
                pool.getConnection()
                    .then(con => con.query(sql))
                    .then(results => resolve(results))
            })
        }
    },
    updateRating: (id, rating) => {
        return new Promise((resolve, reject) => {
            var sql = `UPDATE ${DB_NAME}.movies SET numOfVoters = numOfVoters + 1, rating = (CASE WHEN rating IS NULL THEN 0 ELSE rating END * (numOfVoters-1) + ${rating}) / numOfVoters WHERE id = ${id}`;
            pool.getConnection()
                .then(con => con.query(sql))
                .then(results => resolve(results))
        })
    }
}