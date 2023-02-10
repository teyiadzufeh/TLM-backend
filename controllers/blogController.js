require('dotenv').config();
const res = require("express/lib/response");
require('../db/db');
const { JsonResponse } = require("../lib/apiResponse");
const { MSG_TYPES } = require("../constants/types");
const PostService = require('../services/postService');
const CategoryService = require('../services/categoryService');


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
        return JsonResponse(res, 200, MSG_TYPES.POST_CREATED, newPost);
    } catch (error) {
        console.log(error);
        next(error);        
    }
}

/**
 * GET post/:id
 * Fetch all details of a particular post using its id
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