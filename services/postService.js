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
                `Today’s post is gonna be different. Are you with me?`,
                `I want you to get your pen and your joffer. This post is gonna be written by us. Together.`,
                `Let’s go:`,
                `First of all, you’re gonna have to give the people an intriguing opening paragraph. Something that will have them thinking a bit but not too much that they will have to think about their life.`,
                `Second of all you must know what you’re cooking. Hence this paragraph will be a further introduction but by this time people already wanna start looking for something sweet to make them happy, so give motivation with a sprinkle of banter.`,
                `A quick pause; Lowkey this post feels like I’m writing a book. Pls I don’t want anybody to compare me to Max Lucado or John C. Maxwell. I’m just coming up pls 🤭`,
                `Now back to serious business (of course writing a Teyilovesmondays post is serious business). In the next paragraph, you can start entering your topic more and more. `,
                `At this point your reader should be loving Mondays very well. It’s the perfect time to throw in some one or twos that can give the person joy, while staying on-topic.`,
                `If you even wanna go off-topic pls go ahead. I think that’s what they call “creative licence”. Abi am I wrong ?🤔 `,
                `Now….In the middle of writing the post you might have the “Am I wrong?🤔” question. Very simple. That’s why God created the internet. ASK “GOGGLE”.`,
                `After googling right now (true story) I have discovered that I really meant to say “Poetic Licence”. I might be an accomplished author but we learn everyday🙏🏽. Best part is that if I didn’t tell you, you would never know. So use google so that people will not know that you didn’t know before.`,
                `Amen? Amen.`,
                `The remaining paragraphs are for driving your point home duhh. People are here to be happy about Mondays. Doesn’t mean that you shouldn’t land with your point.`,
                `Any week that you see that I didn’t land with my point, it’s mostly due to the different discombobulating things that I most likely was going through. But a lot of times I convert it to style.`,
                `What’s the moral of that? There is no unwanted situation that you cannot cook to be in your favour. And the crowd goes “hmmm hmmm word word”. `,
                `Final paragraph, you must kneel down and beg people to share your post with other people so that they can also be happy. Then prostrate and tell people that haven’t subscribed to give their lives to Christ and subscribe to the Teyilovesmondays blog using the shiny yellow button below. `,
                `Don’t forget to add “Have a great week” in order not to seem rude. `,
                `Check the link in the Subscribers Section to participate in and win a prize`,
                `Have a great week!🤭`,
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