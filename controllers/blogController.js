require('dotenv').config();
const res = require("express/lib/response");
require('../db/db');
const { JsonResponse } = require("../lib/apiResponse");
const { MSG_TYPES } = require("../constants/types");
const Category = require('../db/models/category');
const Post = require('../db/models/blogPosts');
const PostService = require('../services/postService');
const CategoryService = require('../services/categoryService');
const CommentService = require('../services/commentService');
const SubscribeService = require('../services/subscribeService');
const ContactService = require('../services/contactService');


/**
 * GET /ping
 * Test
 */
exports.ping = async(req,res,next) => {
    try {
        const now = new Date();
        const timestamp = "" + now.toLocaleString();
        return JsonResponse(res, 200, `status: OK\n timestamp: "" + ${now.toLocaleString()}`, timestamp )        
    } catch (error) {
        console.log(error);
        next(error);        
    }
}

/**
 * POST post/create
 * Create a new post
 */
exports.createPost = async(req,res,next) => {
    try {
        let {newPost} = await PostService.createPost(req.body);
        let category = await Category.updateOne({_id: newPost.category},
            {$addToSet: {posts: newPost._id}});
        return JsonResponse(res, 200, MSG_TYPES.POST_CREATED, newPost);
    } catch (error) {
        console.log(error);
        next(error);        
    }
}

/**
 * GET post/:id
 * Fetch all details of a particular post using its postnum
 */
exports.getPost = async(req,res,next) => {
    try {
        let {post} = await PostService.getPost(req.params.id);
        return JsonResponse(res, 200, MSG_TYPES.FETCHED, post);
    } catch (error) {
        console.log(error)
        next(error)
    }
}

/**
 * GET post-by-id/:id
 * Fetch all details of a particular post using its id
 */
exports.getPostbyId = async(req,res,next) => {
    try {
        let {post} = await PostService.getPostbyId(req.params.id);
        return JsonResponse(res, 200, MSG_TYPES.FETCHED, post);
    } catch (error) {
        console.log(error)
        next(error)
    }
}

/**
 * GET posts/all
 * Fetch all details of all the posts
 */
exports.getAllPosts = async(req, res, next) => {
    try {
        let {posts} = await PostService.getAllPosts();
        JsonResponse(res, 200, MSG_TYPES.POSTS_FOUND, posts);
        return;
    } catch (error) {
        console.log(error);
        next(error)        
    }
}
/**
 * GET posts/latest
 * Fetch all details of the latest posts
 */
exports.getLatestPosts = async(req,res,next) => {
    try {
        let {latestPosts} = await PostService.getLatestPosts();
        return JsonResponse(res, 200, MSG_TYPES.FETCHED, latestPosts);
    } catch (error) {
        console.log(error)
        next(error)
    }
}

/**
 * GET posts/featured
 * Fetch all details of the featured posts
 */
exports.getFeaturedPosts = async(req,res,next) => {
    try {
        let {featuredPosts} = await PostService.getFeaturedPosts();
        return JsonResponse(res, 200, MSG_TYPES.FETCHED, featuredPosts);
    } catch (error) {
        console.log(error)
        next(error)
    }
}

/**
 * GET /categories
 * Fetch all categories
 */
exports.getCategories = async (req, res, next) => {
    try {
        let {categories} = await CategoryService.getCategories();
        JsonResponse(res, 200, MSG_TYPES.FETCHED, categories);
        return;
    } catch (error) {
        console.log(error);
        next(error)        
    }
}

/**
 * GET /posts/:category
 * Fetch all posts under a category
 */
exports.getPostsByCategories = async (req, res, next) => {
    try {
        let {posts} = await CategoryService.getPostsbyCategory(req.params.category);
        JsonResponse(res, 200, MSG_TYPES.POSTS_FOUND, posts);
        return;
    } catch (error) {
        console.log(error);
        next(error)        
    }
}
/**
 * POST /post/submit-comment
 * Submit a comment
 */
exports.submitComment = async (req, res, next) => {
    try {
        let {insertedComment} = await CommentService.submitComment(req.body);
        JsonResponse(res, 200, MSG_TYPES.SUBMITTED_SUCCESS, insertedComment);
        return;
    } catch (error) {
        console.log(error);
        next(error)
    }
}

/**
 * GET /post/comments/:postId
 * Get comments on a post
 */
exports.getComments = async (req, res, next) => {
    try {
        let {comments} = await CommentService.getComments(req.params.postId);
        JsonResponse(res, 200, MSG_TYPES.FETCHED, comments);
        return;
    } catch (error) {
        console.log(error);
        next(error)
    }
}

/**
 * GET /comments/:id
 * Get details of a comment
 */
exports.getAComment = async (req, res, next) => {
    try {
        let {comment} = await CommentService.getComment(req.params.id);
        JsonResponse(res, 200, MSG_TYPES.FETCHED, comment);
        return;
    } catch (error) {
        console.log(error);
        next(error)
    }
}

/**
 * PUT /comment/reply/:id
 * Reply a comment
 */
exports.replyComment = async (req, res, next) => {
    try {
        let {updatedComment} = await CommentService.replyComment(req.params.id, req.body);
        JsonResponse(res, 200, 'Reply sent!', updatedComment);
        return;
    } catch (error) {
        console.log(error);
        next(error) 
    }
}

/**
 * POST /submit-details
 * Send a mail to a subscriber
 */
exports.sendSubscribeMail = async (req, res, next) => {
    try {
        let {subscriber}= await SubscribeService.subscribe(req.body);
        JsonResponse(res,200,MSG_TYPES.SUBSCRIBE_MAIL_SENT, subscriber);
        return;
    } catch (error) {
        console.log(error);
        next(error) 
    }
}

/**
 * PUT /subscriber/unsubscribe
 * Subscriber unsubscribing
 */
exports.unsubscribe = async (req, res, next) => {
    try {
        let {unsubscriber}= await SubscribeService.unsubscribe(req.body);
        JsonResponse(res, 200, 'Unsubscribed', unsubscriber);
        return;
    } catch (error) {
        console.log(error);
        next(error) 
    }
}

/**
 * POST /contact/submit
 * Contact us page message sent
 */
exports.contactMessage = async (req, res, next) => {
    try {
        let {contactMessage} = await ContactService.submitContactMessage(req.body);
        JsonResponse(res, 200, MSG_TYPES.SUBMITTED_SUCCESS, contactMessage);
        return;
    } catch (error) {
        console.log(error);
        next(error) 
    }
}