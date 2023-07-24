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
                `Trends come and go. Popping words come and go. Popular internet lingo comes and goes. But there are some words and phrases that are timeless.`,
                `One of these words is “Omo”.`,
                `Whether this year, last year or next year, “Omo” hasn’t lost its appropriate relevance one bit, and it won’t lose it anytime soon. There’s No Competition between this and any other slang or word in terms of emotion-expression. `,
                `It’s a short and simple word that expresses a myriad of emotions all at once.`,
                `You don’t need to say too much. A little “omo” in a sentence helps to let out as much of the emotions in you as possible. It doesn’t matter whether you’re In a Garden, on a plane, or at a bus stop. Wherever. Once you say Omo, your exact emotions are conveyed.`,
                `Omo actually just means “child” in Yoruba language. However, at the moment, you would hear one thousand omos that are not talking about a child, before you hear one that is talking about a child💀. `,
                `If Picasso had the availability of this succinct word, he wouldn’t have drawn or painted half of what he did. He would’ve just said “Omo” and moved on. So easy.`, 
                `There’s a certain Precision you get when you use Omo. It can portray shock, shege, shivering, show of support and so many other emotions. Whoever you’re talking to will Feel it. `, 
                `The simplicity of it is so perfect. Honestly I wonder how we were communicating when the slang “omo” was Unavailable. Thank God for it mehn. If not, omo.`,
                `That’s all from me today! Thanks for reading! It’s our one-year anniversary next week and I’m excited for it! Have a great week ahead!`, 
                // `Today’s post is not so long so that I can give you guys time to plan your wedding that has resulted from this series.`,
                // `Go back to episode 1, do the introduction, proceed to episode 2, do the preparation, take the love language test in episode 3, ask the questions in 4 and 5, and return with your testimonies, hallelujah 🙈🙏🏽.`,
                // `I hope you’ve enjoyed it (this is me being modest o. It’s not like you have a choice o. You must’ve enjoyed it by fire by force🙈). LIKE, SHARE, SUBSCRIBE, FOLLOW FOR FOLLOW, WEDDING FOR WEDDING. Have a great week!`,
                // `Subscribe so that I will follow you on IG and wish you happy birthday pls. I’m starting birthday shoutouts from this month👀🙏🏽. Alright bye!`,
                // `Good newsss! Reader’s choice is open on the IG page! Pls check and grab your chance now🙏🏽👍🏾. Thank you!`,
                // `Finally, subscribe if you haven’t! Thank you!`
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
            // let latestPosts = await redisClient.lrange('latestPosts', 0, 5);
            // // console.log(latestPosts)
            // // let finalLatest = []
            // if (latestPosts != []) latestPosts && console.log("fetching post from redis...", typeof(latestPosts));

            // if (latestPosts = []){
            //     latestPosts = [await redisClient.get('post2'), await redisClient.get('post3')];
            //     for (let index = 0; index < latestPosts.length; index++) {
            //         // finalLatest.push(JSON.stringify(latestPosts[index]));
            //         await redisClient.rpush(`latestPosts`,latestPosts[index]);
            //     }
            //     await redisClient.expire('latestPosts',300)
            //     // redisClient.rpush(`latestPosts`,redisClient.get('post2'),redisClient.get('post3'));
            //     // redisClient.expire('latestPosts',300)
            // }
            resolve({latestPosts});
        })
    }

    //GET FEATURED POSTS
    getFeaturedPosts() {
        return new Promise (async (resolve, reject) => {
            const featuredPosts = await Post.find({featured: true}).limit(3);
            resolve({featuredPosts});
        })
    }
}

module.exports = new PostService();