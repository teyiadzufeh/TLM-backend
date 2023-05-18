require("./startup/logger");
const axios = require('axios');
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

setInterval(() => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://tlm-backend.onrender.com/api/v1/ping',
        headers: { }
      };
      
      axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
}, 1750000);

// setInterval(reload, 1700000)

app.listen(port, () => console.log(`Listening to port ${port}`));