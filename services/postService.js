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
                `Everyday it’s “savings or current?”`,
                `Nobody is asking “o how is your mental health today sir?” We live in very selfish times mehn. We are now being defined by whether it is savings or current!`,
                `In life there are three constant things. Billing, and two other things. I don’t know what the other two things are but I’m sure about Billing😭.`,
                `Let the poor breeve. Don’t suffercate them. You have that responsibility.`, 
                `Almost everyday in this adulthood there’s a reason to be billed. Like why? What is the problem? Ahn ahn. Again I say let the poor breeve.`, 
                `Hence I’ve decided to help you guys (and myself too✋🏽😩🤚🏽) with some helpful tips to defeat the effects of billing. Get ready.`, 
                `First of all, you have to convert Negedivity to a positive drive. Now what this means, is totally up to you. It can mean one thing to one person and another thing to a different person.`, 
                `Secondly, you have to sleep a lot. Being awake too much = serious billing. Even if I tell you not to go out, do you need to go out before one bank in Nigeria will debit you for Card Maintenance Fees for a card you’ve not used in like seven months? Card is in my hand but it’s you I’m paying the money to, to help me maintain it😂.`,
                `Someone that is sleeping cannot know that Accessinith Bank has debited them.`, 
                `Therefore, a serious remedy for billing is to be asleep. If you ask someone that is sleeping about “savings or current”, the person cannot answer you. Hence, cannot be billed🙏🏽👍🏾.`,
                `Then, of course, you can use a screwdriver to create a pathway to fortune. This is another one that means one thing to one person and another thing to a different person. `,
                `The fourth and final one is to say “no” consistently. This one needs a bit of explanation because if they ask you whether you want something good, if you say “no” that’s on you 👍🏾. But say no to billing! In life, you can block some unnecessary billings. From yourself, from “friends”, from even some family members💀 but for this one, I don’t have a problem with you spending “unnecessarily” on family members.`,
                `Avoid making a down payment on roasted corn.`,
                `I won’t choose what you can or should cut down so you must cut it by yourself 👍🏾.`,
                `I’d still say that the surest way is sleeping, to be honest. The security of that one is not 99.9% it is 100%. Albert Einstein said “If I dey sleep, then nobody fit bill me” and I felt that. `,
                `Thank you for reading today’s post. Or I should be thanking myself too because I don’t know where this came from😭. But it has changed my own life😭🙏🏽. So everybody at the count of three let’s say “Thank you Jesus for the inspiration.” 1 2 3?!`,
                `Pls leave a comment as well so that your billing this week will reduce 🙏🏽. I’m just kidding pls but even though even though. Subscribe if you haven’t too!` 
                
                // `———————————————————————-`, 
                // `———————————————————————-`, 
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