require("./startup/logger");
const express = require('express');
const { ExplainVerbosity } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));
// app.use(expressLayouts);

// app.use(cookieParser('TeyisBlogSecure'));
// app.use(session({
//     secret: 'TeyisBlogSecretSession',
//     saveUninittialized: true,
//     resave: true
// }));
// app.use(flash());
// app.use(fileUpload());

// app.set('layout', './layouts/main');
// app.set('view engine', 'ejs');

const routes = require('./routes/blogRoutes');
app.use('/api/v1', routes);

app.listen(port, () => console.log(`Listening to port ${port}`));