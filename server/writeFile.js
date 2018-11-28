const faker = require('faker');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  user: 'student',
  password: 'student',
  host: 'localhost',
  database: 'data',
  connectionLimit: 5,
  permitLocalInfile: true,
});

const myWriteStream = fs.createWriteStream(path.join(__dirname, '/data.csv'), 'utf8');
const inStream = new Readable({
  read() {
    this.push(`${this.i},${this.i},${faker.random.number({ min: 1, max: 5, precision: 0.1 }).toFixed(1)},${faker.name.title()},${faker.lorem.paragraph()},${faker.internet.userName()},${faker.random.number({ min: 30, max: 250 })},${faker.random.number({ min: 10, max: 100 })},${faker.random.number({ min: 0, max: 1 })},${faker.random.number({ min: 1, max: 12 })}/${faker.random.number({ min: 1, max: 31 })}/${faker.random.number({ min: 2017, max: 2018 })}\n`);
    if (this.i++ === 10) {
      this.push(null);
      let connection;
      try {
        pool.getConnection()
          .then(conn => {
            connection = conn;
            conn.query("TRUNCATE TABLE reviews;")
              .then(() => {
                conn.query("LOAD DATA LOCAL INFILE '/home/student/Documents/codeStuff/Reviews/server/data.csv' INTO TABLE reviews FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n';");
              });
          });
      } catch (err) {
        throw err;
      } finally {
        if (connection) return connection.end();
      }
    }
    return 'done';
  },
});

inStream.i = 1;
inStream.pipe(myWriteStream);
