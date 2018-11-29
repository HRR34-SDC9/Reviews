require('newrelic');
const express = require('express');
const path = require('path');
const mariadb = require('mariadb');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');

const pool = mariadb.createPool({
  user: 'root',
  password: 'root',
  host: 'localhost',
  connectionLimit: 5,
  permitLocalInfile: true,
});

const app = express();
app.use(compression());
app.use(cors());
app.use(express.static(`${__dirname}./../client/dist`, { maxAge: '365d' }));
app.use(bodyParser.json());

app.get('/loaderio-89078acd80c0a958ec99b4972b701239/', (req, res) => {
  res.status(200).send('loaderio-89078acd80c0a958ec99b4972b701239');
});

app.get('/product/:productId', (req, res) => {
    const options = {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300',
      },
    };
    const file = path.join(`${__dirname}./../client/dist/index.html`);
    res.sendFile(file, options);
});

app.get('/reviews/:productId', (req, res) => {
  pool.getConnection()
    .then(conn => {
      conn.query(`SELECT * FROM reviews WHERE product_id=${req.params.productId}`)
        .then(queryResponse => {
          // db.end();
          if (queryResponse.length === 0) {
            res.status(404).send('No data found for that product');
          } else {
            res.send([queryResponse[0]]);
          }
        })
        .catch(err => res.status(400).send(err));
    })
    .catch(err => res.status(400).send(err));
});

app.put('/reviews/:productId', (req, res) => {
  const { reviewId, updatedCol, newValue } = req.body;
  pool.getConnection()
    .then(conn => {
      conn.query(
        `UPDATE reviews
        SET ${updatedCol} = ${newValue}
        WHERE id = ${reviewId}`,
      ).then(() => {
        res.send('Update saved');
      });
  });
});

module.exports = { app, pool };
