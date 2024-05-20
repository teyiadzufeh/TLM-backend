const {MSG_TYPES} = require('../constants/types');
const Post = require('../db/models/blogPosts');
const Category = require('../db/models/category');
const { redisClient } = require("../startup/redis.js");

class PostService {
    createPost(body) {
        return new Promise( async (resolve, reject)=>{
            let {name, description, email, category, image, other_images, blockquotes, breakblock, secondbb, featured, sponsored} = body;
            let gory = await Category.findOne({name: category});

            const blocks = [ 
                `If you ever need evidence that something strange is happening to time this year, you can use this blog (or website) as a case study. My last post was literally yesterday. Why is my calendar saying it was March?!`,
                `Oya oya you don catch me😞🙏🏽.`,  
                `I would’ve said I was “rebranding” or something like that, but the honest truth is that I've just not been able to calm down and write anything. There’s been a continuous Error 404 in my head concerning these new posts.`,
                `Like, you know when you have an assignment to do, and you keep postponing (a professional variation of the word “procrastinating”). Then you get to a point where you have to do it, because you don’t want to lose the marks or serve a punishment.`,
                `The problem with my own case is that there are no marks at stake😭. So I could’ve done this laziness till 2055 and nobody would’ve removed any marks from me. But is that really correct though?! Are there not things that signify “marks” when we procrastinate, even in adulthood though?`,
                `This is the part of this post where you say “hmmmmmmm word word, you inspire me Teyi.”`,
                `To avoid this laziness/discombobulation/disorientation leading to Error 404 messages, I will actually have to rebrand. `,
                `I do not intend to leave this post up on this site for more than three weeks. This is for accountability mostly. Pls you have the right to remove my marks or give me a punishment if I don't deliver on this promise of rebranding.`,
                `If you’re not sure about what punishment you want to give, you can send money to me. I will be so annoyed that somebody will send me money at this stage of my life😞. Like imagine the insult???? `,
                `It will motivate me to do better than this. Honestly. In fact that’s what my doctor said.`,
                `Thank you for banking with me, please send any complaint you have, to HR, also known as the comments section below, and my DMs. Have a great week ahead!`
                ]

            

            try {
                if(!gory){
                    reject({code:404, message: MSG_TYPES.CATEGORY_NOT_FOUND});
                    return false;
                }else{
                    category = gory._id;
                }

                const lastPost = await Post.findOne().sort({_id: -1});
                let lastNum = Number(lastPost.postnum);
                let postnum = lastNum + 1;
                postnum.toString();

                const newPost = await Post.insertMany({
                    name,
                    blocks,
                    description,
                    email,
                    category, 
                    image, 
                    other_images, 
                    blockquotes, 
                    breakblock, 
                    secondbb, 
                    postnum,
                    featured,
                    sponsored
                })

                await Category.findByIdAndUpdate(gory._id, {
                    "$push": {"posts": newPost._id}
                })

                resolve({newPost})
            } catch (error) {
                console.log(error)
                reject({ code: 500, message: MSG_TYPES.SERVER_ERROR })
            }

        })
    }
    //GET A POST USING THE POSTNUM
    getPost(id) {
        return new Promise(async(resolve, reject)=>{
            let post = JSON.parse(await redisClient.get(`post${id}`));
            post && console.log("fetching post from redis...");
        
            if(!post){
                post = await Post.findOne({"postnum": id}).populate('category', '-_id');
                redisClient.set(`post${post.postnum}`,JSON.stringify(post), 'ex', 604800);
                if (!post){
                    reject({code: 400, message: MSG_TYPES.NOT_FOUND});
                    return false;
                }
            }

            resolve({post})
        })
    }

    //GET POST BY ID
    getPostbyId(id) {
        return new Promise(async(resolve, reject)=>{
            // check if post is stored in redis server
            let post = JSON.parse(await redisClient.get(`post${id}`));
            post && console.log("fetching post from redis...");
        
            if(!post){
                post = await Post.findById(id).populate('comments', '-_id');
                redisClient.set(`post${id}`,JSON.stringify(post), 'ex', 604800);
                if (!post){
                    reject({code: 400, message: MSG_TYPES.NOT_FOUND});
                    return false;
                }
            }

            resolve({post})
        })
    }
    //GET ALL POSTS
    getAllPosts() {
        return new Promise(async(resolve, reject)=>{
            // const post = await Post.findById(id).populate('category', '-_id');
            try {
                const posts = await Post.find().populate('category', 'name -_id');
                if (!posts){
                    reject({code: 400, message: MSG_TYPES.NOT_FOUND});
                    return false;
                }
    
    
                resolve({posts})
            } catch (error) {
                console.log(error)
                reject({ code: 500, message: MSG_TYPES.SERVER_ERROR })
            }
            

            
        })
    }

    //GET LATEST POSTS
    getLatestPosts() {
        return new Promise(async(resolve, reject)=>{
            const latestPosts = await Post.find().sort({postnum: -1}).limit(5);
            resolve({latestPosts});
        })
    }

    //GET FEATURED POSTS
    getFeaturedPosts() {
        return new Promise (async (resolve, reject) => {
            const featuredPosts = await Post.find({featured: true}).limit(3).sort({_id: -1});
            resolve({featuredPosts});
        })
    }
}

module.exports = new PostService();