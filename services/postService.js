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
                `The fact that today (May 27th) is not a public holiday for us all is enough proof that the government doesn’t value children. `,
                `Are we not all children?! Did any of us fall from the sky?! Were we not all born?! What do you call someone who was born? The answer: a child! `,  
                `Oh sorry that I just went straight into that, I had to get it off my chest. We need to revolutionise this classification of children.`,
                `I can’t believe we have to be doing “Can you see my slides?” instead of “Can you see the way I went down the slide?” Or “Let’s hop on a call” instead of “Let’s go to the bouncing castle.” `,
                `These are the issues.`,
                `In mathematics, there’s something called deduction (this is an educational blog any day I feel like please).`,
                `The people in government are fighting for and holding on to power every year and they call children; leaders of tomorrow. If children are leaders of tomorrow, and we’re not eligible to be leaders yet, can’t we then deduce that we’re still children?!`,
                `We would’ve and should’ve all been preparing to go to the most random children’s day party where they’ll force people to come out and dance, then proceed to ask “IS SHE THE WINNER??” Only for them to shout “NOOOOO”😭😭😭. “Everybody tell her ‘BYE BYEEE’”`,
                `I plan to organise a children’s day celebration for workers. Soon. It will consist of activities including but not limited to; piggybacking (the real version), circling back (the real version) and I promise there’ll be no form of “Tell me about yourself” here. No networking. It will be “DANCE, DANCE, DANCE.”`,
                `In the meantime, I have to get back to work, when all I really wanna do is write one million episodes of this blog. It’s not me, it’s work. Please express your feelings in the comments so that I can invite you to the Children’s Day Celebration for Workers. Or do you not identify as a child?`
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