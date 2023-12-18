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
                `In today’s post, I'm gonna be giving you a free lesson on one of the finest forms of art known to man. Yes, your picture is fine (duhh you took about fifty different pictures that day just to find the right one). But the real question is; Is your caption fine???!`,
                `A good caption can help the beauty of your picture #realtalk. You might think “oh this picture is not that great”. However, with the right caption,,,,,,,, you can transform the destiny of the picture. Okay I think this is becoming too deep😂. Let’s calm down a little.`,
                `In the same vein, a bad caption can spoil the beauty of your picture. I don’t even wanna go too much into this but I think you know what I’m talking about. As I’m typing this, I just remembered one caption that I saw in 2020 and tears nearly rolled down my face😭. I genuinely can’t remember what the picture looks like but I remember the caption so vividly. You see that captions matter innit. Let’s not dwell too much on this. Let’s get into the business of today.`,
                `The first thing you wanna do is identify what kind of vibe you’re trying to pass. Ensure that your caption is alluding perfectly to that vibe. I cannot categorically and unequivocally tell you the different types of vibes but please my brother or sister in The Lord, you will just know🙏🏽.`,
                `Then, make sure your caption is not trying too hard to drive home the point. It’s like a joke, when it drags on for too long it becomes tiring abeg. Which one is “Even if a flow was like mine, I would've never seen a different flow that can ever try to adjust to a different flow that is the same as mine.” Guy abeg. Land please. Ain’t nobody tryna spend four weeks waiting for your caption to land mehn. Save that for your WAEC English exam. `,
                `Keep it as short as possible. Let the crowd want more. Let them read your caption and say “wow wow this person should write a book.”`,
                `Some bonus techniques I can suggest: you can use song lyrics, movie quotes, bible verses (if you want extra coolness you can just post the reference e.g John 12:1). This information is not what they share in schools but I’m trying my best to bring it to you🙏🏽.`,
                `Now, no matter what you do in this life, your caption shouldn’t point out something that is wrong with your picture. You’re just diverting the attention of the masses to a minor mishap. Don’t apologise for something that is wrong with the picture. If you do this, you’re indirectly saying “EVERYONE TAKE A LOOK AT SOMETHING THAT’S WRONG WITH MY PICTURE”. Meanwhile if you didn’t do that, only a few people would’ve noticed.`,
                `Mistakes happen! Anyone that sees the mistake in your picture should clap for themselves. They should apply for detective jobs. Great for them. But what you’ll never do is point it out. And if you feel like you’re not so comfortable with not highlighting the errors to the public, perhaps, maybe, I don’t know, don’t post the picture(s)🤔? You will have better pictures in future. Let that one go.`,
                `I hope I've been able to help you and not unhelp you (I can’t think of the opposite of help right now). Pls send your pictures to me when you use these helpful tips. If you need help constructing a suitable caption for your picture pls send me a message on IG or anywhere you feel like. My services are free (for now).`,
                `Also, share this with your friends and family and tell them to subscribe please. It’s gonna be worth their time. Have a great week! `,
                // `Check the link in the Subscribers Section to participate in and win a prize`,
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