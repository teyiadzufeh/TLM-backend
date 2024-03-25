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
                `This life na chess not checkers. Walk with me.`,
                `I’ve been doing a lot of deep thinking recently.`,  
                `It’s a lie o. Who is thinking deeply in this heat? or in this cold? (for my foreign readers. You can see that the weather is bad everywhere) But yeah this life is more of chess than checkers. I said walk with me please🙏🏾.`,
                `In chess, you always have to think two or three or even four moves ahead, it doesn’t mean that you won’t think in checkers but just know there are levels to thinking. You have to plan ahead for future instances that are within and without (accept my English) your control.`,
                `You can be looking at something now and you realise that the real koko of this present matter is based on two or three matters from now. In fact, if you check three paragraphs from now, you’ll realise that this paragraph and that paragraph have some form of interconnectability amongst themselves. If you have been walking with me since, you can upgrade now and ride with me. You deserve.👍🏾`,
                `One must be careful to guard their rooks properly, because if you’re not careful in the night, you can lose your knight, as it will become a pawn in the equation of life. As I write this, you cannot imagine the amount of swelling that my head is going through at the moment. This is DIVINE INSPIRATION.`,
                `There will then be only one solution to that problem; a prayer from your bishop, because the hearts of kings and dare I say queens, are in the Hands of God.`,
                `Basically what I was trying to say three paragraphs ago is that you must plan. If you fail to plan, you plan to fail. Meaning that while it’s sweet to wing things in life a lot of times, one must be careful to plan sensibly to ensure we do not find ourselves inside unnecessary rubbish.`,
                `If you haven’t noticed by now, I have just recently started playing chess. It’s too sweet mehn. I get why people are heavily invested in it.💀`,
                `Pls I’m down for a chess game with anybody if you’re interested. I’m just learning pls, don’t cook me too much. Now, for my next post I will be `,
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