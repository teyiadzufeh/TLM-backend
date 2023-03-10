const express = require('express');
// const router = express.Router();
const blogController = require('../controllers/blogController');
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression")
const logger = require("../startup/logger");
const error = require("../middlewares/errors");
const endpointNotFound = require("../middlewares/404");
const app = express();

//cors set-up
const corsOptions = {
    origin: "*",
    exposedHeaders: ["x-auth-token"],
};

// APP Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb", extended: true }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(morgan('tiny'));
app.use(helmet());
app.use(compression()); //compress all request

//log every request url
app.use((req, res, done) => {
	logger.http(`${req.method} ${req.originalUrl} ${res.statusCode}`);
	done();
});

/**
 * App Routes
 */
app.get('/ping', blogController.ping);
app.post('/post/create', blogController.createPost);
app.get('/post/:id', blogController.getPost);
app.get('/posts/all', blogController.getAllPosts);
app.get('/posts/latest', blogController.getLatestPosts);
app.get('/posts/featured', blogController.getFeaturedPosts);
app.get('/categories', blogController.getCategories);
app.get('/posts/:category', blogController.getPostsByCategories);
app.post('/post/submit-comment', blogController.submitComment);
app.get('/comments/:postId', blogController.getComments);
app.get('/comment/:id', blogController.getAComment);
app.put('/comment/:id/reply', blogController.replyComment);
app.post('/subscriber/submit-details', blogController.sendSubscribeMail);
app.put('/subscriber/unsubscribe', blogController.unsubscribe);



//global error handlers
app.use(error);
app.use(endpointNotFound);

module.exports = app;