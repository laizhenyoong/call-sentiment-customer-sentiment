// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000'
}));

// Use the routes
app.use('/', routes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
