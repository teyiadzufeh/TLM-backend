const {MSG_TYPES} = require('../constants/types');
const Comment = require('../db/models/comment');
const Post = require('../db/models/blogPosts');
const Category = require('../db/models/category');

class CommentService {
    submitComment(body){
        return new Promise(async(resolve,reject) => {
            let {name, email, comment, post_id} = body;
            let post = await Post.findById(post_id);
            if(!post){
                reject({code:400, message:MSG_TYPES.POST_NOT_FOUND})
                return false;
            }
            try {
                const insertedComment = await Comment.insertMany({
                    name,
                    email,
                    comment,
                    post: post_id
                });

                post.comments.push(insertedComment[0]._id);
                await Post.findByIdAndUpdate(post_id, {comments: post.comments});

                resolve({insertedComment})
            } catch (error) {
                console.log(error)
                reject({ code: 500, message: MSG_TYPES.SERVER_ERROR })
            }

        })
    }

    //reply a comment
    replyComment(id, body) {
        return new Promise(async(resolve, reject) => {
            let {name, message} = body;
            let comment = await Comment.findById(id);
            if(!comment){
                reject({code:400, message:MSG_TYPES.NOT_FOUND})
                return false;
            }

            try {
                const reply = {
                    name,
                    message
                }

                comment.replies.push(reply);

                const updatedComment = await Comment.findByIdAndUpdate(id, {replies: comment.replies});
                resolve({updatedComment})
            } catch (error) {
                console.log(error)
                reject({ code: 500, message: MSG_TYPES.SERVER_ERROR })
            }
        })
    }
    //get a single comment
    getComment(id) {
        return new Promise(async(resolve, reject) => {
            const comment = await Comment.findById(id);

            if(!comment){
                reject({code:400, message:MSG_TYPES.NOT_FOUND})
                return false;
            }
            resolve({comment})
        })
    }

    //get comments under a post
    getComments(post_id){
        return new Promise(async(resolve, reject) =>{
            const comments = await Comment.find({post: post_id});
            resolve({comments})
        })
    }
}

module.exports = new CommentService();