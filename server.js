require('dotenv').config();

const express = require('express');

let app = express();

var port = process.env.PORT || 8080;

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', (error) => console.error(error));

db.once('open', () => console.log('connected to database'));

app.get('/', (req, res) => res.send('Hello World with Express'));

app.listen(port, () => {
    console.log("Running server on port " + port);
});