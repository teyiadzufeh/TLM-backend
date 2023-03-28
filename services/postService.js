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
                `Before we start, Pls note that this is a continuation of Currency Race 1 (Post 13).`,
                `Normally and as expected, Ms. Dollars won the race. Or so we think.`,
                `To be honest, we are/were not so much interested in Ms. Dollars’ life. It’s like those youtubers whose lives are always doing well. Today, \"I bought a house\". Tomorrow, \"I bought a car\". The day after tomorrow you bought land. Can’t you praise God? Can’t your tyre burst one day? (I’m just kidding pls 💀 don’t take this seriously).`,
                `The koko of the matter is that Dollars and Euros finished the race. I cannot categorically tell you their positions because the cameramen in the race were distracted by the mighty Naira and they forgot to follow the people in front. Well, back to the remaining people in the race.`,
                `As the race was going on, Naira just went missing. I mean everybody was enjoying the stunts of Naira (in last position) but all of a sudden, the people giving racing advice to Naira, told Naira to leave the racetrack and disappear from the public. Why will a full currency, be playing ‘Hard to Get’?😭 `,
                `The Passive Ovation Sector (POS for short) were the only ones with access to the whereabouts of Naira. Their own forming was the worst😭. And only God can forgive them. No, don't beg me. I dey vex.`,
                `Accessbank employees then decided to come out for their own performance but everything they tried to do was just Ayo and Teo. Reverse kings. Kings of bounce back. The instigators of plate-washing. No, don't beg me fr. I dey vex again.`,
                `The performance did not pacify anything. In fact everything they did just made things worse. The announcers in the stadium suggested that if people were feeling tired from sitting, they could transfer to another seat. You can imagine the chaos involved with hundreds of thousands of people trying to make transfers at the same time. Get it?😃`,
                `Ms. Kobo then tried to interview different people to keep everyone engaged. Content Creating Queen🤭.`,
                `\"Hello sir can you explain how you feel about all this that is going on? And how is the crowd reacting to this, sir?\" The man searched through his elaborate vocabulary and struggled to find only a few words: \"Many people are angry. Ermm a lot is uhm going on and Wo, Pressure ti wa!😭\"`,
                `In case you’re still wondering, we did not find Naira o. As per till now we’re still doing transfer o. Apparently, it’s good for the economy but Pressure ti wa (translates to \"Ye ye ye. There is enormous pressure in the atmosphere amongst the able citizens in this blezzed country\"). I really hope the pressure is not really affecting you in this period if you’re in Nigeria (yeah I know I gotta lotta international readers too haha). If it’s affecting you pls text me let me see what I cannot do🙏🏾.`,
                `Thank you for reading this! I ‘ppreciate you and I’d like you to share and tell your friends and families that Teyi is back loving Mondays o. Pls leave a comment down below and follow on Instagram (@thewritingsthatteyipromised) Tnxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx. Subscribe if you haven’t plsss.`,
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
            // check if post is stored in redis server
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