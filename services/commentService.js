const {MSG_TYPES} = require('../constants/types');
const Comment = require('../db/models/comment');
const Post = require('../db/models/blogPosts');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const { Transporter } = require('../utils');
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
                if (updatedComment){
                    let commentPost = await Post.findById(comment.post);
                    const subject = 'TeyiLovesMondays Notifications - Someone replied to your comment!';
                    const html =`
                    <p>Hi ${comment.name}!</p>
                    <p>${name} replied to your comment on the blog!</p>
                    <p>Click <a href="https://teyilovesmondays.vercel.app/posts/${commentPost.postnum}">here</a> to check it out!</p>
                    <p>Alright bye bye👍🏾</p>`;

                    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
                    oAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN});
                    const accessToken = oAuth2Client.getAccessToken();
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',                 
                        logger: true, // log info
                        auth: {
                            type: 'OAuth2',
                            user: process.env.email, 
                            clientId: process.env.CLIENT_ID,
                            clientSecret: process.env.CLIENT_SECRET,
                            refreshToken: process.env.REFRESH_TOKEN,
                            accessToken: accessToken
                        },
                        tls: {
                            // do not fail on invalid certs
                            rejectUnauthorized: false,
                        }
                    })

                    const mailOption = {
                        from: `Teyilovesmondays <${process.env.email}>`,
                        to: comment.email,
                        subject: subject,
                        html: html
                    }
                    
                    transporter.sendMail(mailOption, function(err,data){
                        if (err) {
                            console.log('Error', err);
                        } else {
                            console.log('Email Sent');
                        }
                    });
                    // await Transporter(comment.email, subject, html);
                }
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