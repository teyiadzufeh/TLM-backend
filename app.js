require("./startup/logger");
const express = require('express');
const { ExplainVerbosity } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));

const routes = require('./routes/blogRoutes');
app.use('/api/v1', routes);

const reload = async(req,res,next) => {
        const now = new Date()
        console.log("reloaded at", now.toLocaleString())
        return ("OK for reload at ", now.toLocaleString());
}

setInterval(reload, 1700000)

app.listen(port, () => console.log(`Listening to port ${port}`));