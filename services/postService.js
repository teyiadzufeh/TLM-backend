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
                `Not probably, you definitely need one. “But are you advising us to go for a vacation in March???” Yes. Quite frankly, I am.`,
                `The first three months of the year are usually the busiest. Every office/business, serious or unserious, big or small, likes to go extra hard at the beginning of the year, particularly because they feel like the December break was “long” (it wasn’t). And naturally, individuals also like to go extra hard at the beginning of the year because I mean, that’s when ginger is highest.`,  
                `If you go very hard for the first two to three months of the year, chances are, you’ll get tired early. That’s fine mehn. It’s only normal. That’s why several new year’s resolutions only last a short while loool. Your body, like a bicycle, becomes too tired. Your mind will then give in. What could’ve been resolved with a short break/vacation will now spiral into several months of nothing.`,
                `Then when December comes again, you’ll be cutting people off because “they didn’t help you achieve your goals” meanwhile you just needed to take a quick vacation to reboot😂. `,
                `You don’t have to travel far for this vacation, because most workplaces don’t really care about your mental health tbh, so if you come with the “I need a break” thing, they can swear for you😭. Hence, you must become a self-induced vacationist. Be a bad guy (please note that I will not be held responsible if they carry you. Apply wisdom🙏🏾).`,
                `When I say be a bad guy, I mean, manage your workload by yourself. It’s not every workcall that you’ll do with all your strength during this self-induced vacation. Reschedule as much as possible. Na you get your vacation, make nobody use “let’s hop on a quick call” to finish you.`,
                `Read Teyilovesmondays episodes for that whole self-induced vacation week. Watch movies (that make sense, because there are movies you might watch that will make you vex) during this break. Watch football (avoid Chelsea matches for now😔). Go out, do something interesting. Go for a checkup, in the hospital and with Whot cards. `,
                `Did I mention that you should read Teyilovesmondays posts for that whole week? Or for the few days. With this few points of mine, I hope I’ve been able to confuse you and not convince you that a teacher is better than a lawyer.`
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