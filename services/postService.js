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
                `The first day I heard the word diaspora, I thought it was a terrible condition or a disease. Then I realised that it was always said in the format: “xyz people in diaspora” and I was like “wow. this is definitely a disease”. Pls I was like ten years old at this point, don’t judge me lest ye be judged also because I know there are several things you didn’t know at 10👍🏾.`,
                `Fast forward how many years later and I’ve realised that if I see my 10-year-old self now, I will knock him for thinking that it was anything like a disease or a problem to say “Nigerians in diaspora” 😭. This country is constantly fighting anybody that has refused to diaspora themselves (poetic licence please allow me👍🏾). I think if we look at it carefully, the undiasporaed are seeming like the people going through something 😂. So 10-year-old Teyi, you were so wrong.`,
                `First of all, at this present day and time, the exchange rate (which apparently affects everything including the purchasing price of Happy Happy biscuit) is currently running a reverse race. You know all those posts where someone says “It costs literally $0 to be a nice person” or something like that, that $0 is now equivalent to NGN50-100 😭. If you don’t read this post on time, it might be N150 when you read it (God forbid God forbid). In summary, e don dey cost to be nice person o😭. That’s just how bad this exchange rate is now.`,
                `That’s why I’m not even shocked when people vex anyhow on the streets these days. Instead of being nice, they’re saving the money. Financial wisdom please.`,
                `I invested $1 in something in August (yes I’m an investor too, just dey play😁). I lost about $0.04 from August to October but when I converted that money to naira, it was worth more than the $1 in August😂. And you’re saying people shouldn’t try to run. Even the bible says to flee from every appearance of evil. Is Nigeria not appearing to be an appearance of evil at the moment??                `,
                `With the policies and different wickednesses (poetic licence again🙏🏽) orchestrated by the policymakers, you just know they’re trying to send people away from this country. That’s why you can’t even make a new friend or hold on to your old friends too much because next week Wednesday, they’re leaving the country🥲. There are like 6 people in the entire country but there’s still traffic in Lagos.`,
                `Like the topic implies, these guys are trying to fight me and anyone in the country. It’s like Fury v Ngannou but the problem is I’m just a spectator. The power of winning this fight is not necessarily in my hands🫠. `,
                `If you’re still in Nigeria, congratulations to you. If you’re not in Nigeria, congratulations to you too. If you’re still reading Teyilovesmondays posts then triple congratulations to you please. I’m back by the special grace of God😭🙏🏽. Pls share this post with others if you can, and have a great week! If you’ve gotten this far and you want to apply yourself to diaspora (poetic licence again) pls reach out to…`,
                // `Now if you don’t understand the reference in the previous paragraph, that’s okay because that’s also from a trend, and most trends last days, not even months. Hence, you might not discover the trend before its lifespan expires 🙏🏽. That’s fine. Move on. You will join the next trend 👍🏾.`,
                // `You wanna know what’s not a trend so there’s no limit to how much you can do it? Sharing the Teyilovesmondays blog with people 🙏🏽. Thank you for reading, and I’ll love to hear what you think about it in the comments 🙏🏽. Have a nice week!"`,
                // `Don’t forget to add “Have a great week” in order not to seem rude. `,
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