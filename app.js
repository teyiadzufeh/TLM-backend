require("./startup/logger");
const express = require('express');
const { ExplainVerbosity } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));

const routes = require('./routes/blogRoutes');
app.use('/api/v1', routes);

app.listen(port, () => console.log(`Listening to port ${port}`));