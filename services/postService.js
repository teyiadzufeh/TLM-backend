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
                `It’s Wrapped Time! Ready? *you should say “Yes! I’m ready!” Okay, since you’re ready, Let’s do this!`,
                `I think the amount of time it has taken me to put out this recap/wrapped/replay is just very representative of how this Wrapped is gonna be😂. I would say this has been a very busy year for me but as I said to someone recently, “na man wey work go chop innit?” As at the time this post is coming out, there have been 50 weeks in the year. Half of 50 is 25.`,
                `There have been 25 posts on the blog this year (excluding this Wrapped duh)! And out of those 25, I have enjoyed putting out 24 of them. The only one I didn’t enjoy was the Subsidy Removal episode (Episode 29) because true true that one no be meme.`,
                `31.5. That’s the number of times tiredness from the previous week with a large sprinkle of laziness, made me not drop the post on time, or sometimes not drop the post at all💀. The .5 there is the day that Gbemisola Oyewumi the designer tried to spoil the Teyilovesmondays blog with his own hand.`,
                `My most consistent month? June. I mean this one is pretty understandable right? If you don’t get it, forget about it. I’m just kidding, please you don’t have the “forget about it” option here. Go to the Posts page and look for all the posts in June to understand better.`,
                `Commercial break please. I have a question to ask (please answer in the comments), what do people do as hobbies or for fun these days pls? Affordable things please; before Timi will put something outrageous.`,
                `4. This is the number of times I forgot it was Monday, hence there was no post on said days. This is due to several factors but I’m pretty sure on one of those days they wanted to use “Hello Teyi pls share your update” to finish me. Plus on another one of those days I was looking forward to Friday so I decided to start my week on Thursday. No vex for me please.`,
                `The number of times I have channelled my vex for Nigeria into writing a post, is like 22 times. I’ve probably released only 6. Some of them cannot be released because if you reason this country too much at once, you might not be able to reason normally for like 72 hours after.`,
                `22+6+72=100. That’s the percentage of times I have loved reading the comments on this blog. I’m really grateful to see the comments on each and every post and I’m grateful to everyone who takes time out to read and comment. I ‘ppreciate you my dawg!`,
                `Now for the post with the most comments/engagements in-general. No need for a drumroll, it’s post 18 (The Currency Race Episode). I don’t think that’s my best one this year but who am I to go against the people?`,
                `Last but not the least, there have been 9 different sponsors on the Teyilovesmondays posts this year! They’re all people doing really cool things in their businesses or careers et al. You can always reach out to me if you wanna sponsor (via my IG or through the contact page on this website). It’s free!`,
                `Thank you for rocking with Teyilovesmondays this year. Next year is definitely gonna be better! Okay please don’t forget to answer the question I asked. Have a nice 2024!`,
                // `Have a great week!🤭`,
                // `1. People that saw all the red flags but still chose to be with the person`,
                // `2. People that decided to study five-year courses in uni.`,
                // `The last but not the least is the Most Special Person in the world award. And the nominees are:`,
                // `1. People that read the Teyilovesmondays blog`,
                // `2. People that tell other people about the Teyilovesmondays blog`,
                // `3. People that talk subscribe to the Teyilovesmondays blog`, 
                // `How many awards did you win?! And which award is your favorite?! Let me know in the comments below! Have a great week ahead.`, 
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