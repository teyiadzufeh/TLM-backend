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
                `Tears are almost flowing out of my eyes as I’m writing this because e don definitely tey.`,
                `I think the fact that all of us have different hobbies and things that pique our interests is nice to see. And everyone has the right to enjoy (or not enjoy) different things and that’s okay. But you see football? Where do I kick this off from?`,
                `There are some things where you’re like “I can clearly see the Hand of God in it.” Football is one of those things. Tell me why we’re watching 22  maybe-random human beings running around on grass, kicking leather, nearly tearing each other’s shirts, and shouting at each other, yet it’s the most intriguing thing ever.`,
                `It can only be God pls.`,
                `All the other TV shows are cute and all but pls have you seen anywhere people are shouting “GOALLLLLL” or whatever thing, after Captain America has used his shield to jam someone?`,
                `Nothing gives the adrenaline rush like football pls.`,
                `Yes in football sometimes you will experience what they call downtimes (Man United and Arsenal fans are familiar with this a lot🫢) but that’s part of the sweetness. You know that everybody’s time is coming so you enjoy the good times as they come and you get through the bad as they come too; a valuable life lesson.`,
                `I can’t remember when last I watched any movie that taught me a valuable life lesson. All they do in movies is just to be lying and showing things that are not real. `,
                `Pls I know that movies are nice and all, I watch them sometimes but why would I choose “I will stand with you between the heavens and the earth” when in football that’s where the real ‘stand with you between the heaven and the earth’ happens (Ronaldo fans these days😞). You must learn loyalty by force.`,
                `It’s not just movies but like other random interests as well. They just don’t have the appropriate power to give that adrenaline rush like football #realTalk.`,
                `If you're one of those people that is usually annoyed because football season is back I implore you today my dear, join the train. Stop fighting it!`,
                `My final whistle of the day is that I’m happy football is fully back and it’s been so long (five years to be precise). I’m glad you’re back reading the Teyilovesmondays blog too, but if this is your first time pls subscribe using the button below and share as well.`, 
                `You will not receive a yellow or red card this week in Jesus’ name👍🏾🙏🏽.`, 
                // `By the way, this is my Grammy-collection speech. I just did copy and paste.`, 
                // `One year of Teyi Loving Mondays! And I hope you’ve been able to love Mondays a little more because of this blog. There’s definitely more to come! `,
                // `This week I don’t even need you to share this with your friends and… I’m sorry I couldn’t say that with a straight face. Pls share it abeg I didn’t write Grammy-collection speech for nothing. Have a great week!`,
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